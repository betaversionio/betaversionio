'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProjectStatus } from '@betaversionio/shared';
import { useProjects } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyProjectCard } from '@/features/projects';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';

const statusFilters = ['All', ...Object.values(ProjectStatus)] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function MyProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  const { data, isLoading, error } = useProjects({
    authorId: 'me',
    ...(activeFilter !== 'All' && { status: activeFilter }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Projects"
        description="Manage and showcase your projects."
      >
        <Button asChild>
          <Link href="/my-projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </PageHeader>

      <Tabs
        value={activeFilter}
        onValueChange={(v) => setActiveFilter(v as StatusFilter)}
      >
        <TabsList>
          {statusFilters.map((status) => (
            <TabsTrigger key={status} value={status}>
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">
              Failed to load projects. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {activeFilter === 'All'
                ? 'No projects yet'
                : `No ${activeFilter.toLowerCase()} projects`}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {activeFilter === 'All'
                ? 'Create your first project to showcase your work'
                : `You don\u2019t have any projects with ${activeFilter.toLowerCase()} status`}
            </p>
            {activeFilter === 'All' && (
              <Button asChild>
                <Link href="/my-projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project) => (
            <MyProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
