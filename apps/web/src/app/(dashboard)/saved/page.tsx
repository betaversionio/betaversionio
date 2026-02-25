'use client';

import { useState } from 'react';
import { useBookmarkedProjects } from '@/hooks/queries/use-project-queries';
import { ProjectCard } from '@/features/projects';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Loader2, Bookmark } from 'lucide-react';

export default function SavedPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBookmarkedProjects(page);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Projects"
        description="Projects you've bookmarked for later."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No saved projects</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bookmark projects to find them here later.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
