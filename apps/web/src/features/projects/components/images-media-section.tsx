'use client';

import { useCallback, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateProjectInput } from '@devcom/shared';
import { GalleryUpload } from '@/components/patterns/p-file-upload-4';
import type { FileWithPreview } from '@/hooks/use-file-upload';
import { useUploadToR2 } from '@/hooks/use-upload-to-r2';
import { useToast } from '@/hooks/use-toast';

interface ImagesMediaSectionProps {
  form: UseFormReturn<CreateProjectInput>;
}

export function ImagesMediaSection({ form }: ImagesMediaSectionProps) {
  const { setValue } = form;
  const { toast } = useToast();
  const imageUpload = useUploadToR2({ folder: 'projects/images' });

  // Map fileId → R2 public URL (persists across re-renders)
  const uploadedUrls = useRef<Map<string, string>>(new Map());

  const handleFilesChange = useCallback(
    async (files: FileWithPreview[]) => {
      // Remove entries for files that were deleted
      const currentIds = new Set(files.map((f) => f.id));
      for (const id of uploadedUrls.current.keys()) {
        if (!currentIds.has(id)) {
          uploadedUrls.current.delete(id);
        }
      }

      // Upload any new files that haven't been uploaded yet
      const newFiles = files.filter(
        (f) => f.file instanceof File && !uploadedUrls.current.has(f.id),
      );

      if (newFiles.length > 0) {
        const uploads = newFiles.map(async (fileItem) => {
          try {
            const publicUrl = await imageUpload.upload(
              fileItem.file as File,
            );
            uploadedUrls.current.set(fileItem.id, publicUrl);
          } catch {
            toast({
              title: 'Image upload failed',
              description: `Could not upload "${(fileItem.file as File).name}".`,
              variant: 'destructive',
            });
          }
        });
        await Promise.all(uploads);
      }

      // Build the images array from uploaded URLs (preserving order)
      const urls = files
        .map((f) => uploadedUrls.current.get(f.id))
        .filter((url): url is string => !!url);

      setValue('images', urls);
    },
    [imageUpload, setValue, toast],
  );

  return (
    <div>
      <GalleryUpload
        maxFiles={10}
        maxSize={10 * 1024 * 1024}
        onFilesChange={handleFilesChange}
      />
      {imageUpload.isUploading && (
        <p className="mt-2 text-xs text-muted-foreground">
          Uploading {imageUpload.pending} image
          {imageUpload.pending > 1 ? 's' : ''}...
        </p>
      )}
    </div>
  );
}
