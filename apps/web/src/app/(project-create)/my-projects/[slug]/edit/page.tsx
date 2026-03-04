'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema } from '@betaversionio/shared';
import type { CreateProjectInput } from '@betaversionio/shared';
import { useProject, useUpdateProject } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import {
  ProjectCreationSidebar,
  MainInfoSection,
  ImagesMediaSection,
  type ProjectFormTab,
} from '@/features/projects';
import { Loader2 } from 'lucide-react';

const tabMeta: Record<
  ProjectFormTab,
  { title: string; description: string }
> = {
  main: {
    title: 'Main Information',
    description: 'Update your project identity and core details',
  },
  media: {
    title: 'Images & Media',
    description: 'Manage screenshots and visuals for your project',
  },
};

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProject(slug);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          {error?.message ?? 'Project not found.'}
        </p>
      </div>
    );
  }

  return <EditProjectForm project={project} />;
}

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  logo: string | null;
  tagline: string | null;
  description: string;
  links: string[];
  isOpenSource: boolean;
  images: string[];
  techStack: string[];
  tags: string[];
  status: string;
  phase: string;
  productionType: string;
}

function EditProjectForm({ project }: { project: ProjectData }) {
  const router = useRouter();
  const { toast } = useToast();
  const updateProject = useUpdateProject(project.slug);
  const [activeTab, setActiveTab] = useState<ProjectFormTab>('main');

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(
      createProjectSchema,
    ) as unknown as Resolver<CreateProjectInput>,
    defaultValues: {
      title: project.title,
      slug: project.slug,
      tagline: project.tagline ?? '',
      description: project.description,
      logo: project.logo ?? undefined,
      links: project.links,
      isOpenSource: project.isOpenSource,
      images: project.images,
      techStack: project.techStack,
      tags: project.tags,
      status: project.status as CreateProjectInput['status'],
      phase: project.phase as CreateProjectInput['phase'],
      productionType:
        project.productionType as CreateProjectInput['productionType'],
    },
  });

  async function onSubmit() {
    const isValid = await form.trigger();
    if (!isValid) {
      setActiveTab('main');
      return;
    }

    const data = form.getValues();

    try {
      await updateProject.mutateAsync(data);
      toast({
        title: 'Project updated',
        description: 'Your changes have been saved.',
      });
      router.push('/my-projects');
    } catch (error) {
      toast({
        title: 'Failed to update project',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  const meta = tabMeta[activeTab];

  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-background">
        <ProjectCreationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSubmit={onSubmit}
          isSubmitting={updateProject.isPending}
          submitLabel="Save Changes"
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-20 md:px-6 md:pb-12 md:pt-20 lg:px-8 lg:pb-16 lg:pt-22">
            <div className="mx-auto max-w-3xl">
              {/* Tab header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              {activeTab === 'main' && <MainInfoSection form={form} />}
              {activeTab === 'media' && <ImagesMediaSection form={form} />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
