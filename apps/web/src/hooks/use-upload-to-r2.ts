'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface PresignedUrlResponse {
  url: string;
  key: string;
  publicUrl: string;
}

interface UploadToR2Options {
  folder: string;
}

interface UploadState {
  isUploading: boolean;
  /** Number of files currently in flight */
  pending: number;
  error: string | null;
}

/**
 * Hook that uploads files to Cloudflare R2 via presigned URLs.
 *
 * Flow:
 * 1. POST /storage/presigned-url → get presigned upload URL + public URL
 * 2. PUT the file directly to R2 using the presigned URL
 * 3. Return the public URL to store in the form
 */
export function useUploadToR2({ folder }: UploadToR2Options) {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    pending: 0,
    error: null,
  });

  const upload = useCallback(
    async (file: File): Promise<string> => {
      setState((prev) => ({
        isUploading: true,
        pending: prev.pending + 1,
        error: null,
      }));

      try {
        // 1. Get presigned URL from the API
        const { url, publicUrl } =
          await apiClient.post<PresignedUrlResponse>(
            '/storage/presigned-url',
            {
              fileName: file.name,
              contentType: file.type,
              folder,
            },
          );

        // 2. Upload the file directly to R2
        const res = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }

        return publicUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed';
        setState((prev) => ({ ...prev, error: message }));
        throw err;
      } finally {
        setState((prev) => {
          const pending = prev.pending - 1;
          return {
            ...prev,
            pending,
            isUploading: pending > 0,
          };
        });
      }
    },
    [folder],
  );

  const uploadMany = useCallback(
    async (files: File[]): Promise<string[]> => {
      const results = await Promise.all(files.map(upload));
      return results;
    },
    [upload],
  );

  return { upload, uploadMany, ...state };
}
