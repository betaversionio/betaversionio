'use client';

import { useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateBlogInput } from '@devcom/shared';
import { GalleryUpload } from '@/components/patterns/p-file-upload-4';

interface BlogCoverSectionProps {
  form: UseFormReturn<CreateBlogInput>;
}

export function BlogCoverSection({ form }: BlogCoverSectionProps) {
  const { setValue, getValues } = form;
  const initialUrls = useRef(
    getValues('coverImage') ? [getValues('coverImage')!] : [],
  ).current;

  return (
    <GalleryUpload
      maxFiles={1}
      maxSize={5 * 1024 * 1024}
      uploadFolder="blogs/covers"
      initialUrls={initialUrls}
      onUpload={(urls) => setValue('coverImage', urls[0] ?? undefined)}
    />
  );
}
