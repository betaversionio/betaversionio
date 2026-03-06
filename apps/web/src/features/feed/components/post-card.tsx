'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactionType } from '@betaversionio/shared';
import { useToggleReaction, useCreateComment, usePost, useDeletePost } from '../hooks';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Markdown } from '@/components/ui/markdown';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Heart, Message, Send2, More, ExportSquare } from 'iconsax-react';
import { Link2, Trash2, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PostData } from '../types';
import { timeAgo, formatCount } from '@/lib/format';
import { reactionConfig, postTypeLabels } from '../config';

function PostComments({
  postId,
  user,
  commentText,
  setCommentText,
  onSubmit,
  isSubmitting,
}: {
  postId: string;
  user: { name?: string | null; avatarUrl?: string | null } | null;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { data: postDetail, isLoading } = usePost(postId);
  const comments = postDetail?.comments ?? [];

  return (
    <div className="border-t">
      {/* Existing comments */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <span className="text-xs text-muted-foreground">
            Loading comments...
          </span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 px-4 pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Link href={`/@${comment.author.username}`}>
                <UserAvatar
                  src={comment.author.avatarUrl}
                  name={comment.author.name}
                  className="h-7 w-7 shrink-0"
                  fallbackClassName="text-[9px]"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="rounded-xl bg-muted/50 px-3 py-2">
                  <Link
                    href={`/@${comment.author.username}`}
                    className="text-xs font-semibold hover:underline"
                  >
                    {comment.author.name ?? comment.author.username}
                  </Link>
                  <p className="text-xs leading-relaxed">{comment.content}</p>
                </div>
                <span className="ml-3 text-[10px] text-muted-foreground">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Comment input */}
      <div className="px-4 py-3">
        <div className="flex gap-2.5">
          <UserAvatar
            src={user?.avatarUrl}
            name={user?.name}
            className="h-8 w-8 shrink-0"
            fallbackClassName="text-[10px]"
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border bg-muted/50 px-3 py-1">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-full text-primary disabled:opacity-40"
              disabled={!commentText.trim()}
              isLoading={isSubmitting}
              onClick={onSubmit}
            >
              <Send2 size={14} color="currentColor" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostCard({
  post,
  defaultShowComments = false,
}: {
  post: PostData;
  defaultShowComments?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const toggleReaction = useToggleReaction(post.id);
  const createComment = useCreateComment(post.id);
  const deletePost = useDeletePost();
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [commentText, setCommentText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const isOwner = user?.id === post.author.id;
  const profileHref = `/@${post.author.username}`;

  const reactions = post.reactions ?? [];
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const activeReactions = reactions.filter((r) => r.count > 0);
  const userReaction = reactions.find((r) => r.hasReacted);
  const userReactionConfig = userReaction
    ? reactionConfig[userReaction.type]
    : null;

  async function handleSubmitComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ content: trimmed });
    setCommentText('');
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/feed/${post.id}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copied to clipboard' });
  }

  async function handleDelete() {
    try {
      await deletePost.mutateAsync(post.id);
      toast({ title: 'Post deleted' });
      if (window.location.pathname === `/feed/${post.id}`) {
        router.push('/feed');
      }
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
    setShowDeleteDialog(false);
  }

  return (
    <>
      <Card className="rounded-xl">
        {/* Author header */}
        <div className="flex items-start gap-3 px-4 pt-4">
          <Link href={profileHref}>
            <UserAvatar
              src={post.author.avatarUrl}
              name={post.author.name}
              className="h-10 w-10 shrink-0"
              fallbackClassName="text-xs"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={profileHref}
                className="truncate text-sm font-semibold hover:underline"
              >
                {post.author.name ?? post.author.username}
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">
                &middot; {timeAgo(post.createdAt)}
              </span>
            </div>
            <Link
              href={profileHref}
              className="text-xs text-muted-foreground hover:underline"
            >
              @{post.author.username}
            </Link>
          </div>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
              >
                <More size={16} color="currentColor" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleCopyLink} className="gap-2 text-xs">
                <Link2 className="h-4 w-4" />
                Copy link
              </DropdownMenuItem>
              {isOwner ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast({ title: 'Post reported' })}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Flag className="h-4 w-4" />
                    Report post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post type indicator */}
        {post.type !== 'Text' && (
          <div className="px-4 pt-2">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0 text-[10px] font-medium"
            >
              {postTypeLabels[post.type] ?? post.type}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pt-3 pb-2">
          {post.title && (
            <h3 className="mb-1.5 text-base font-semibold leading-snug">
              {post.title}
            </h3>
          )}
          <Markdown content={post.content} size="sm" />
        </div>

        {/* Hashtags */}
        {(post.hashtags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-x-1.5 gap-y-1 px-4 pb-3">
            {(post.hashtags ?? []).map((tag) => (
              <span
                key={tag}
                className="cursor-pointer text-xs font-medium text-primary hover:underline"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Reaction summary bar */}
        {(totalReactions > 0 || post.commentsCount > 0) && (
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-1.5">
              {activeReactions.length > 0 && (
                <div className="flex -space-x-1">
                  {activeReactions.slice(0, 3).map((r) => {
                    const config = reactionConfig[r.type];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <span
                        key={r.type}
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full border-2 border-card',
                          r.type === 'Like' ? 'bg-red-500' : 'bg-muted',
                        )}
                      >
                        <Icon
                          size={10}
                          variant="Bold"
                          color={r.type === 'Like' ? 'white' : 'currentColor'}
                        />
                      </span>
                    );
                  })}
                </div>
              )}
              {totalReactions > 0 && (
                <span className="text-xs text-muted-foreground">
                  {formatCount(totalReactions)}
                </span>
              )}
            </div>
            {post.commentsCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatCount(post.commentsCount)}{' '}
                {post.commentsCount === 1 ? 'comment' : 'comments'}
              </span>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="border-t">
          <div className="flex items-center px-2 py-1">
            {/* Reaction button */}
            <div
              className="relative flex-1"
              onMouseEnter={() => setShowAllReactions(true)}
              onMouseLeave={() => setShowAllReactions(false)}
            >
              <Button
                variant="ghost"
                className={cn(
                  'h-10 w-full gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground',
                  userReactionConfig && userReactionConfig.activeColor,
                )}
                onClick={() => {
                  if (userReaction) {
                    toggleReaction.mutate({ type: userReaction.type as ReactionType });
                  } else {
                    toggleReaction.mutate({ type: ReactionType.Like });
                  }
                }}
              >
                {userReactionConfig ? (
                  <userReactionConfig.icon
                    size={18}
                    color="currentColor"
                    variant="Bulk"
                  />
                ) : (
                  <Heart size={18} color="currentColor" variant="Linear" />
                )}
                {userReactionConfig?.label ?? 'Like'}
              </Button>

              {/* Reaction picker on hover */}
              {showAllReactions && (
                <div className="absolute bottom-full left-0 z-50 pb-2">
                  <div className="flex gap-1 rounded-full border bg-card p-1.5 shadow-lg">
                    {Object.values(ReactionType).map((type) => {
                      const config = reactionConfig[type];
                      if (!config) return null;
                      const Icon = config.icon;
                      const reaction = reactions.find((r) => r.type === type);
                      const isActive = reaction?.hasReacted ?? false;
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            toggleReaction.mutate({ type: type as ReactionType });
                            setShowAllReactions(false);
                          }}
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-125',
                            isActive && config.activeColor,
                          )}
                          title={config.label}
                        >
                          <Icon
                            size={20}
                            color="currentColor"
                            variant={isActive ? 'Bulk' : 'Linear'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Comment button */}
            <Button
              variant="ghost"
              className={cn(
                'h-10 flex-1 gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground',
                showComments && 'text-primary',
              )}
              onClick={() => setShowComments(!showComments)}
            >
              <Message size={18} color="currentColor" />
              Comment &middot; {post.commentsCount}
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              className="h-10 flex-1 gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={async () => {
                const url = `${window.location.origin}/feed/${post.id}`;
                const shareData = {
                  title: post.title || `Post by ${post.author.name ?? post.author.username}`,
                  url,
                };
                if (navigator.share) {
                  try {
                    await navigator.share(shareData);
                  } catch {
                    // user cancelled
                  }
                } else {
                  await navigator.clipboard.writeText(url);
                  toast({ title: 'Link copied to clipboard' });
                }
              }}
            >
              <ExportSquare size={18} color="currentColor" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <PostComments
            postId={post.id}
            user={user}
            commentText={commentText}
            setCommentText={setCommentText}
            onSubmit={handleSubmitComment}
            isSubmitting={createComment.isPending}
          />
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This post and all its comments will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
