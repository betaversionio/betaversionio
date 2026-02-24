'use client';

import { Markdown } from '@/components/ui/markdown';
import { ImageGallery } from './image-gallery';

interface OverviewTabProps {
  images: string[];
  title: string;
  description: string;
}

export function OverviewTab({ images, title, description }: OverviewTabProps) {
  return (
    <div className="mt-6 space-y-6">
      {images.length > 0 && <ImageGallery images={images} title={title} />}

      {description ? (
        <Markdown content={description} />
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          No description provided.
        </p>
      )}
    </div>
  );
}
