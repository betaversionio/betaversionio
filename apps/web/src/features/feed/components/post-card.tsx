'use client';

import { useState } from 'react';
import { ReactionType } from '@devcom/shared';
import { useToggleReaction, useCreateComment, usePost } from '../hooks';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Markdown } from '@/components/ui/markdown';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Heart, Message, Send2, More } from 'iconsax-react';
import type { PostData } from '../types';
import { timeAgo, formatCount } from '../utils';
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
          <span className="text-xs text-muted-foreground">Loading comments...</span>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 px-4 pt-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <UserAvatar
                src={comment.author.avatarUrl}
                name={comment.author.name}
                className="h-7 w-7 shrink-0"
                fallbackClassName="text-[9px]"
              />
              <div className="min-w-0 flex-1">
                <div className="rounded-xl bg-muted/50 px-3 py-2">
                  <span className="text-xs font-semibold">
                    {comment.author.name ?? comment.author.username}
                  </span>
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

export function PostCard({ post }: { post: PostData }) {
  const { user } = useAuth();
  const toggleReaction = useToggleReaction(post.id);
  const createComment = useCreateComment(post.id);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const reactions = post.reactions ?? [];
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const likeReaction = reactions.find((r) => r.type === 'Like');
  const hasLiked = likeReaction?.hasReacted ?? false;
  const activeReactions = reactions.filter((r) => r.count > 0);

  async function handleSubmitComment() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ content: trimmed });
    setCommentText('');
  }

  return (
    <Card className="rounded-xl">
      {/* Author header */}
      <div className="flex items-start gap-3 px-4 pt-4">
        <UserAvatar
          src={post.author.avatarUrl}
          name={post.author.name}
          className="h-10 w-10 shrink-0"
          fallbackClassName="text-xs"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {post.author.name ?? post.author.username}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              &middot; {timeAgo(post.createdAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            @{post.author.username}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
        >
          <More size={16} color="currentColor" />
        </Button>
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
          {/* Like button */}
          <div className="relative flex-1">
            <Button
              variant="ghost"
              className={cn(
                'h-10 w-full gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground',
                hasLiked && 'text-red-500 hover:text-red-600',
              )}
              onClick={() => toggleReaction.mutate({ type: ReactionType.Like })}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowAllReactions(!showAllReactions);
              }}
            >
              <Heart
                size={18}
                color="currentColor"
                variant={hasLiked ? 'Bold' : 'Linear'}
              />
              Like &middot; {post.likesCount}
            </Button>

            {/* Reaction picker on right-click */}
            {showAllReactions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowAllReactions(false)}
                />
                <div className="absolute -top-12 left-0 z-50 flex gap-1 rounded-full border bg-card p-1.5 shadow-lg">
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
                          variant={isActive ? 'Bold' : 'Linear'}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
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

          {/* Send / Share button */}
          <Button
            variant="ghost"
            className="h-10 flex-1 gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Send2 size={18} color="currentColor" />
            Send
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
  );
}
