'use client';

import { useCallback, useRef, useState } from 'react';
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from '@/hooks/use-file-upload';
import { useUploadToR2 } from '@/hooks/use-upload-to-r2';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import {
  CircleAlert,
  ImageIcon,
  Loader2,
  Upload,
  X,
  ZoomIn,
} from 'lucide-react';

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
  /** R2 folder path — when provided, files are auto-uploaded to R2 */
  uploadFolder?: string;
  /** Called with the list of public URLs whenever the set changes */
  onUpload?: (urls: string[]) => void;
  /** Pre-existing image URLs to display (e.g. from an existing project) */
  initialUrls?: string[];
}

export function GalleryUpload({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*',
  multiple = true,
  className,
  onFilesChange,
  uploadFolder,
  onUpload,
  initialUrls,
}: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // ─── R2 upload state ─────────────────────────────────────────────────────────
  const r2 = useUploadToR2({ folder: uploadFolder ?? '' });

  // fileId → R2 public URL
  const uploadedUrls = useRef<Map<string, string>>(new Map());
  // IDs currently being uploaded (ref for async correctness, state for UI)
  const inFlightIds = useRef<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  // Latest file list (ref so async callbacks see current value)
  const filesRef = useRef<FileWithPreview[]>([]);

  // Convert initialUrls → FileMetadata for the useFileUpload hook (runs once)
  const [initialFileEntries] = useState<FileMetadata[]>(() => {
    const entries = (initialUrls ?? []).map((url, i) => ({
      id: `existing-${i}`,
      name: url.split('/').pop() ?? `image-${i}`,
      size: 0,
      type: 'image/jpeg',
      url,
    }));
    // Pre-populate the URL map so existing images are in the output from the start
    entries.forEach((f) => uploadedUrls.current.set(f.id, f.url));
    return entries;
  });

  // Emit the current URL list derived from the latest files + uploadedUrls map
  const emitUrls = useCallback(() => {
    if (!onUpload) return;
    const urls = filesRef.current
      .map((f) => uploadedUrls.current.get(f.id))
      .filter((url): url is string => !!url);
    onUpload(urls);
  }, [onUpload]);

  // Intercept file changes to handle R2 uploads when uploadFolder is set
  const handleFilesChanged = useCallback(
    async (files: FileWithPreview[]) => {
      filesRef.current = files;
      onFilesChange?.(files);

      if (!uploadFolder) return;

      // Remove entries for files that were deleted
      const currentIds = new Set(files.map((f) => f.id));
      for (const id of uploadedUrls.current.keys()) {
        if (!currentIds.has(id)) uploadedUrls.current.delete(id);
      }

      // Emit immediately (handles removal case)
      emitUrls();

      // Find new files that need uploading
      const newFiles = files.filter(
        (f) =>
          f.file instanceof File &&
          !uploadedUrls.current.has(f.id) &&
          !inFlightIds.current.has(f.id),
      );

      if (newFiles.length > 0) {
        for (const f of newFiles) inFlightIds.current.add(f.id);
        setUploadingIds(new Set(inFlightIds.current));

        await Promise.all(
          newFiles.map(async (fileItem) => {
            try {
              const publicUrl = await r2.upload(fileItem.file as File);
              uploadedUrls.current.set(fileItem.id, publicUrl);
            } catch {
              // error is tracked by r2.error
            } finally {
              inFlightIds.current.delete(fileItem.id);
              setUploadingIds(new Set(inFlightIds.current));
            }
          }),
        );

        // Emit after uploads complete (uses latest filesRef)
        emitUrls();
      }
    },
    [onFilesChange, uploadFolder, r2, emitUrls],
  );

  const [
    { files, isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: initialFileEntries,
    onFilesChange: handleFilesChanged,
  });

  const isImage = (file: { type: string }) => {
    return file.type.startsWith('image/');
  };

  const handleClear = () => {
    clearFiles();
    uploadedUrls.current.clear();
    inFlightIds.current.clear();
    setUploadingIds(new Set());
    onUpload?.([]);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'rounded-lg relative border border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input {...getInputProps()} className="sr-only" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              isDragging ? 'bg-primary/10' : 'bg-muted',
            )}
          >
            <ImageIcon
              className={cn(
                'h-5 w-5',
                isDragging ? 'text-primary' : 'text-muted-foreground',
              )}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload images to gallery</h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop images here or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG, GIF up to {formatBytes(maxSize)} each (max {maxFiles}{' '}
              files)
            </p>
          </div>

          <Button onClick={openFileDialog}>
            <Upload className="h-4 w-4" />
            Select images
          </Button>
        </div>
      </div>

      {/* Gallery Stats */}
      {files.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-medium">
              Gallery ({files.length}/{maxFiles})
            </h4>
            {uploadFolder ? (
              uploadingIds.size > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading {uploadingIds.size} image
                  {uploadingIds.size > 1 ? 's' : ''}...
                </span>
              )
            ) : (
              <div className="text-muted-foreground text-xs">
                Total:{' '}
                {formatBytes(
                  files.reduce((acc, file) => acc + file.file.size, 0),
                )}
              </div>
            )}
          </div>
          <Button onClick={handleClear} variant="outline" size="sm">
            Clear all
          </Button>
        </div>
      )}

      {/* Image Grid */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="group/item relative aspect-square"
            >
              {isImage(fileItem.file) && fileItem.preview ? (
                <>
                  {loadingImages[fileItem.id] !== false && (
                    <div className="bg-muted/50 rounded-lg absolute inset-0 flex items-center justify-center border">
                      <Spinner className="text-muted-foreground size-6" />
                    </div>
                  )}
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    onLoad={() =>
                      setLoadingImages((prev) => ({
                        ...prev,
                        [fileItem.id]: false,
                      }))
                    }
                    className={cn(
                      'rounded-lg h-full w-full border object-cover transition-all group-hover/item:scale-105',
                      loadingImages[fileItem.id] !== false
                        ? 'opacity-0'
                        : 'opacity-100',
                    )}
                  />
                </>
              ) : (
                <div className="bg-muted rounded-lg flex h-full w-full items-center justify-center border">
                  <ImageIcon className="text-muted-foreground h-8 w-8" />
                </div>
              )}

              {/* R2 uploading overlay */}
              {uploadingIds.has(fileItem.id) && (
                <div className="rounded-lg absolute inset-0 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="rounded-lg bg-black/50 absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover/item:opacity-100">
                {/* View Button */}
                {fileItem.preview && (
                  <Button
                    onClick={() => {
                      setSelectedImage(fileItem.preview!);
                      setIsPreviewLoading(true);
                    }}
                    variant="secondary"
                    size="icon"
                    className="size-7"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                )}

                {/* Remove Button */}
                <Button
                  onClick={() => removeFile(fileItem.id)}
                  variant="secondary"
                  size="icon"
                  className="size-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* File Info */}
              <div className="rounded-b-lg absolute right-0 bottom-0 left-0 bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover/item:opacity-100">
                <p className="truncate text-xs font-medium">
                  {fileItem.file.name}
                </p>
                {fileItem.file.size > 0 && (
                  <p className="text-xs text-gray-300">
                    {formatBytes(fileItem.file.size)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {(errors.length > 0 || r2.error) && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlert />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
            {r2.error && <p className="last:mb-0">{r2.error}</p>}
          </AlertDescription>
        </Alert>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="[&_[data-slot=dialog-close]]:text-muted-foreground [&_[data-slot=dialog-close]]:hover:text-foreground [&_[data-slot=dialog-close]]:bg-background w-full border-none bg-transparent p-0 shadow-none sm:max-w-xl [&_[data-slot=dialog-close]]:-end-7 [&_[data-slot=dialog-close]]:-top-7 [&_[data-slot=dialog-close]]:size-7 [&_[data-slot=dialog-close]]:rounded-full">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {selectedImage && (
              <>
                {isPreviewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner className="size-8 text-white" />
                  </div>
                )}
                <img
                  src={selectedImage}
                  alt="Preview"
                  onLoad={() => setIsPreviewLoading(false)}
                  className={cn(
                    'rounded-lg h-full w-auto object-contain transition-opacity duration-300',
                    isPreviewLoading ? 'opacity-0' : 'opacity-100',
                  )}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
