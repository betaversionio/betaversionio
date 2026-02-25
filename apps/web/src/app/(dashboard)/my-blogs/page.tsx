'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BlogStatus } from '@devcom/shared';
import { useBlogs } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyBlogCard } from '@/features/blogs';
import { Plus, FileText, Loader2 } from 'lucide-react';

const statusFilters = ['All', ...Object.values(BlogStatus)] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function MyBlogsPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  const { data, isLoading, error } = useBlogs({
    authorId: 'me',
    ...(activeFilter !== 'All' && { status: activeFilter }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Blogs"
        description="Write and manage your blog posts."
      >
        <Button asChild>
          <Link href="/my-blogs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Blog
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
              Failed to load blogs. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {activeFilter === 'All'
                ? 'No blog posts yet'
                : `No ${activeFilter.toLowerCase()} blogs`}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {activeFilter === 'All'
                ? 'Write your first blog post to share your thoughts'
                : `You don\u2019t have any blogs with ${activeFilter.toLowerCase()} status`}
            </p>
            {activeFilter === 'All' && (
              <Button asChild>
                <Link href="/my-blogs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Write Blog
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((blog) => (
            <MyBlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
