'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useProject, useRecordProjectView } from '@/hooks/queries/use-project-queries';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { DocumentText1, People, Star1, Refresh } from 'iconsax-react';
import { ProjectSidebar } from '@/features/projects/components/detail/project-sidebar';
import { OverviewTab } from '@/features/projects/components/detail/overview-tab';
import { TeamTab } from '@/features/projects/components/detail/team-tab';
import { ReviewsTab } from '@/features/projects/components/detail/reviews-tab';
import { UpdatesTab } from '@/features/projects/components/detail/updates-tab';
import { RelatedProjects } from '@/features/projects/components/detail/related-projects';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  const { data: project, isLoading, error } = useProject(slug);
  const recordView = useRecordProjectView(project?.id ?? '');

  useEffect(() => {
    if (project?.id) {
      recordView.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <p className="mt-2 text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === project.authorId;

  return (
    <div className="container px-4 pb-8 pt-20 md:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <ProjectSidebar project={project} />

          <div className="min-w-0 flex-1 overflow-hidden">
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">
                  <DocumentText1 size={14} color="currentColor" variant="Linear" className="mr-1.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="team">
                  <People size={14} color="currentColor" variant="Linear" className="mr-1.5" />
                  Team
                  {project.makers.length > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {project.makers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <Star1 size={14} color="currentColor" variant="Linear" className="mr-1.5" />
                  Reviews
                  {project.reviewsCount > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {project.reviewsCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="updates">
                  <Refresh size={14} color="currentColor" variant="Linear" className="mr-1.5" />
                  Updates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab
                  images={project.images}
                  title={project.title}
                  description={project.description}
                  demoUrl={project.demoUrl}
                  videoUrl={project.videoUrl}
                />
              </TabsContent>

              <TabsContent value="team">
                <TeamTab
                  makers={project.makers}
                  projectId={project.id}
                  isOwner={isOwner}
                />
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsTab
                  projectId={project.id}
                  averageRating={project.averageRating}
                  reviewsCount={project.reviewsCount}
                />
              </TabsContent>

              <TabsContent value="updates">
                <UpdatesTab projectId={project.id} isOwner={isOwner} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <RelatedProjects slug={slug} />
      </div>
    </div>
  );
}
