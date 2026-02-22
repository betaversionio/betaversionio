'use client';

import { useState } from 'react';
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from '@/hooks/use-file-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { CircleAlert, ImageIcon, Upload, X, ZoomIn } from 'lucide-react';

interface GalleryUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
}

export function GalleryUpload({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*',
  multiple = true,
  className,
  onFilesChange,
}: GalleryUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

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
    onFilesChange,
  });

  const isImage = (file: { type: string }) => {
    return file.type.startsWith('image/');
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'rounded-lg relative border border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/10 hover:border-muted-foreground/20',
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
            <div className="text-muted-foreground text-xs">
              Total:{' '}
              {formatBytes(
                files.reduce((acc, file) => acc + file.file.size, 0),
              )}
            </div>
          </div>
          <Button onClick={clearFiles} variant="outline" size="sm">
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

              {/* Overlay */}
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
                <p className="text-xs text-gray-300">
                  {formatBytes(fileItem.file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlert />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
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
