'use client';

import { Markdown } from '@/components/ui/markdown';
import { ImageGallery } from './image-gallery';
import { DemoEmbed } from './demo-embed';

interface OverviewTabProps {
  images: string[];
  title: string;
  description: string;
  demoUrl?: string | null;
  videoUrl?: string | null;
}

export function OverviewTab({ images, title, description, demoUrl, videoUrl }: OverviewTabProps) {
  return (
    <div className="mt-6 space-y-6">
      {images.length > 0 && <ImageGallery images={images} title={title} />}

      <DemoEmbed demoUrl={demoUrl} videoUrl={videoUrl} />

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
