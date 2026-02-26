'use client';

import { useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CreateProjectInput } from '@betaversionio/shared';
import { GalleryUpload } from '@/components/patterns/p-file-upload-4';

interface ImagesMediaSectionProps {
  form: UseFormReturn<CreateProjectInput>;
}

export function ImagesMediaSection({ form }: ImagesMediaSectionProps) {
  const { setValue, getValues } = form;
  // Capture initial URLs once (empty for create, populated for edit)
  const initialUrls = useRef(getValues('images')).current;

  return (
    <GalleryUpload
      maxFiles={10}
      maxSize={10 * 1024 * 1024}
      uploadFolder="projects/images"
      initialUrls={initialUrls}
      onUpload={(urls) => setValue('images', urls)}
    />
  );
}
