'use client';

import { useCallback, useRef } from 'react';
import { Refresh, Message } from 'iconsax-react';
import { PostComposer, PostCard, FeedSidebar, useFeed } from '@/features/feed';

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex gap-6">
      {/* Main feed */}
      <div className="min-w-0 flex-[5] space-y-4">
        {/* Composer */}
        <PostComposer />

        {/* Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Refresh
              size={24}
              color="currentColor"
              className="animate-spin text-muted-foreground"
            />
          </div>
        ) : allPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
            <Message
              size={40}
              color="currentColor"
              variant="Bulk"
              className="mb-3 text-muted-foreground/40"
            />
            <p className="text-sm font-medium text-muted-foreground">
              No posts yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Be the first to share something with the community
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            <div ref={loadMoreRef} className="py-6 text-center">
              {isFetchingNextPage ? (
                <Refresh
                  size={20}
                  color="currentColor"
                  className="mx-auto animate-spin text-muted-foreground"
                />
              ) : hasNextPage ? (
                <p className="text-xs text-muted-foreground/60">
                  Scroll for more
                </p>
              ) : allPosts.length > 0 ? (
                <p className="text-xs text-muted-foreground/60">
                  You&apos;ve reached the end
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar — hidden on mobile/tablet */}
      <aside className="hidden min-w-0 flex-[2] xl:block">
        <div className="sticky top-0">
          <FeedSidebar />
        </div>
      </aside>
    </div>
  );
}
