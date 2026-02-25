'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBlogSchema } from '@devcom/shared';
import type { CreateBlogInput } from '@devcom/shared';
import { useBlog, useUpdateBlog } from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import {
  BlogCreationSidebar,
  BlogMainInfoSection,
  BlogCoverSection,
  type BlogFormTab,
} from '@/features/blogs';
import { Loader2 } from 'lucide-react';

const tabMeta: Record<
  BlogFormTab,
  { step: number; title: string; description: string }
> = {
  main: {
    step: 1,
    title: 'Main Information',
    description: 'Update your blog post title, content, and details',
  },
  cover: {
    step: 2,
    title: 'Cover Image',
    description: 'Manage the cover image for your blog post',
  },
};

export default function EditBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useBlog(slug);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          {error?.message ?? 'Blog not found.'}
        </p>
      </div>
    );
  }

  return <EditBlogForm blog={blog} />;
}

interface BlogData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  status: string;
}

function EditBlogForm({ blog }: { blog: BlogData }) {
  const router = useRouter();
  const { toast } = useToast();
  const updateBlog = useUpdateBlog(blog.slug);
  const [activeTab, setActiveTab] = useState<BlogFormTab>('main');

  const form = useForm<CreateBlogInput>({
    resolver: zodResolver(
      createBlogSchema,
    ) as unknown as Resolver<CreateBlogInput>,
    defaultValues: {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt ?? '',
      content: blog.content,
      coverImage: blog.coverImage ?? undefined,
      tags: blog.tags,
      status: blog.status as CreateBlogInput['status'],
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
      await updateBlog.mutateAsync(data);
      toast({
        title: 'Blog updated',
        description: 'Your changes have been saved.',
      });
      router.push('/my-blogs');
    } catch (error) {
      toast({
        title: 'Failed to update blog',
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
        <BlogCreationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSubmit={onSubmit}
          isSubmitting={updateBlog.isPending}
          submitLabel="Save Changes"
        />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-10 pt-20 md:px-6 md:pb-12 md:pt-20 lg:px-8 lg:pb-16 lg:pt-22">
            <div className="mx-auto max-w-3xl">
              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {meta.step}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {meta.step} of 2
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              {activeTab === 'main' && <BlogMainInfoSection form={form} />}
              {activeTab === 'cover' && <BlogCoverSection form={form} />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
