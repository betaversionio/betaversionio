'use client';

import { AvatarUpload as AvatarUploadPattern } from '@/components/patterns/p-file-upload-2';
import type { FileWithPreview } from '@/hooks/use-file-upload';

interface ProfileAvatarUploadProps {
  avatarUrl?: string | null;
  onFileChange?: (file: FileWithPreview | null) => void;
}

export function ProfileAvatarUpload({
  avatarUrl,
  onFileChange,
}: ProfileAvatarUploadProps) {
  return (
    <AvatarUploadPattern
      maxSize={10 * 1024 * 1024}
      defaultAvatar={avatarUrl ?? undefined}
      onFileChange={onFileChange}
    />
  );
}
