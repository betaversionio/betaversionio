'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'iconsax-react';
import { Loader2 } from 'lucide-react';
import { PostCard, usePost } from '@/features/feed';
import { Button } from '@/components/ui/button';

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(id);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back navigation */}
      <Button
        variant="ghost"
        className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft size={18} color="currentColor" />
        Back
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !post ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-medium text-muted-foreground">
            Post not found
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            This post may have been deleted or doesn&apos;t exist
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/feed')}
          >
            Go to Feed
          </Button>
        </div>
      ) : (
        <PostCard post={post} defaultShowComments />
      )}
    </div>
  );
}
