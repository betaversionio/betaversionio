'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  ProjectStatus,
  ProjectPhase,
  ProductionType,
} from '@betaversionio/shared';
import type { CreateProjectInput } from '@betaversionio/shared';
import { useCreateProject } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import {
  ProjectCreationSidebar,
  MainInfoSection,
  ImagesMediaSection,
  MakersSection,
  type ProjectFormTab,
} from '@/features/projects';

const tabMeta: Record<
  ProjectFormTab,
  { step: number; title: string; description: string }
> = {
  main: {
    step: 1,
    title: 'Main Information',
    description: 'Set up your project identity and core details',
  },
  media: {
    step: 2,
    title: 'Images & Media',
    description: 'Add screenshots and visuals to showcase your project',
  },
  makers: {
    step: 3,
    title: 'Makers',
    description: 'Add the people who helped bring this project to life',
  },
};

export default function CreateProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProject = useCreateProject();
  const [activeTab, setActiveTab] = useState<ProjectFormTab>('main');

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(
      createProjectSchema,
    ) as unknown as Resolver<CreateProjectInput>,
    defaultValues: {
      title: '',
      slug: '',
      tagline: '',
      description: '',
      logo: undefined,
      links: [],
      isOpenSource: false,
      images: [],
      techStack: [],
      tags: [],
      status: ProjectStatus.Draft,
      phase: ProjectPhase.Idea,
      productionType: ProductionType.Hobby,
      makers: [],
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
      await createProject.mutateAsync(data);
      toast({
        title: 'Project created',
        description: 'Your project has been published successfully.',
      });
      router.push('/my-projects');
    } catch (error) {
      toast({
        title: 'Failed to create project',
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
          isSubmitting={createProject.isPending}
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-20 md:px-6 md:pb-12 md:pt-20 lg:px-8 lg:pb-16 lg:pt-22">
            <div className="mx-auto max-w-3xl">
              {/* Tab header */}
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {meta.step}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {meta.step} of 3
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              {activeTab === 'main' && <MainInfoSection form={form} />}
              {activeTab === 'media' && <ImagesMediaSection form={form} />}
              {activeTab === 'makers' && <MakersSection form={form} />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
