'use client';

import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from '@/hooks/use-file-upload';
import { useUploadToR2 } from '@/hooks/use-upload-to-r2';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CircleAlert, Loader2, User, X } from 'lucide-react';

interface AvatarUploadProps {
  maxSize?: number;
  className?: string;
  rounded?: 'full' | 'md';
  onFileChange?: (file: FileWithPreview | null) => void;
  defaultAvatar?: string;
  /** R2 folder path — when provided, the component uploads automatically */
  uploadFolder?: string;
  /** Called with the public URL after a successful upload, or undefined on remove */
  onUpload?: (url: string | undefined) => void;
}

export function AvatarUpload({
  maxSize = 2 * 1024 * 1024, // 2MB
  className,
  rounded = 'full',
  onFileChange,
  defaultAvatar,
  uploadFolder,
  onUpload,
}: AvatarUploadProps) {
  const r2 = useUploadToR2({ folder: uploadFolder ?? '' });

  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: 'image/*',
    multiple: false,
    onFilesChange: async (files) => {
      const file = files[0] || null;
      onFileChange?.(file);

      if (!uploadFolder) return;

      if (!file || !(file.file instanceof File)) {
        onUpload?.(undefined);
        return;
      }

      try {
        const publicUrl = await r2.upload(file.file);
        onUpload?.(publicUrl);
      } catch {
        // error state is tracked by r2.error
      }
    },
  });

  const currentFile = files[0];
  const previewUrl = currentFile?.preview || defaultAvatar;

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
      if (uploadFolder) onUpload?.(undefined);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            'group/avatar relative h-48 w-48 cursor-pointer overflow-hidden border border-dashed transition-colors',
            rounded === 'full' ? 'rounded-full' : 'rounded-lg',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            previewUrl && 'border-solid',
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps()} className="sr-only" />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="text-muted-foreground size-10" />
            </div>
          )}

          {r2.isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Remove Button - only show when file is uploaded */}
        {currentFile && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleRemove}
            className="absolute end-0.5 top-0.5 z-10 size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
            aria-label="Remove avatar"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="space-y-0.5 text-center">
        <p className="text-sm font-medium">
          {r2.isUploading
            ? 'Uploading...'
            : currentFile
              ? 'Avatar uploaded'
              : 'Upload avatar'}
        </p>
        <p className="text-muted-foreground text-xs">
          PNG, JPG up to {formatBytes(maxSize)}
        </p>
      </div>

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
    </div>
  );
}
