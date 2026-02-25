'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface DemoEmbedProps {
  demoUrl?: string | null;
  videoUrl?: string | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function getLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9-]+)/);
  return match?.[1] ?? null;
}

export function DemoEmbed({ demoUrl, videoUrl }: DemoEmbedProps) {
  if (!demoUrl && !videoUrl) return null;

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const loomId = videoUrl && !youtubeId ? getLoomId(videoUrl) : null;

  return (
    <div className="space-y-4">
      {/* Video embed */}
      {youtubeId && (
        <div className="aspect-video overflow-hidden rounded-lg border">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title="Video demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {loomId && (
        <div className="aspect-video overflow-hidden rounded-lg border">
          <iframe
            src={`https://www.loom.com/embed/${loomId}`}
            title="Video demo"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      )}

      {/* If video URL given but unrecognized, link out */}
      {videoUrl && !youtubeId && !loomId && (
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Watch Video
          </a>
        </Button>
      )}

      {/* Demo website link */}
      {demoUrl && (
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href={demoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Visit Demo
          </a>
        </Button>
      )}
    </div>
  );
}
