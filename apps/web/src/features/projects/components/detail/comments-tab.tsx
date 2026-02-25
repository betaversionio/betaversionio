'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProjectComment } from '@/hooks/queries/use-project-queries';
import {
  useProjectComments,
  useCreateProjectComment,
  useUpdateProjectComment,
  useDeleteProjectComment,
} from '@/hooks/queries/use-project-queries';
import { useAuth } from '@/providers/auth-provider';
import { timeAgo } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { UserAvatar } from '@/components/shared/user-avatar';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Message } from 'iconsax-react';

/* ─── Single comment (recursive for replies) ─── */

function CommentItem({
  comment,
  projectId,
  depth = 0,
}: {
  comment: ProjectComment;
  projectId: string;
  depth?: number;
}) {
  const { user } = useAuth();
  const createComment = useCreateProjectComment(projectId);
  const updateComment = useUpdateProjectComment(projectId);
  const deleteComment = useDeleteProjectComment(projectId);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwn = user?.id === comment.authorId;

  async function handleReply() {
    if (!replyContent.trim()) return;
    await createComment.mutateAsync({
      content: replyContent.trim(),
      parentId: comment.id,
    });
    setReplyContent('');
    setReplying(false);
  }

  async function handleEdit() {
    if (!editContent.trim()) return;
    await updateComment.mutateAsync({
      commentId: comment.id,
      data: { content: editContent.trim() },
    });
    setEditing(false);
  }

  async function handleDelete() {
    await deleteComment.mutateAsync(comment.id);
    setDeleteOpen(false);
  }

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex w-8 shrink-0 flex-col items-center pt-3">
          <UserAvatar
            src={comment.author.avatarUrl}
            name={comment.author.name}
            className={depth > 0 ? 'h-6 w-6' : 'h-8 w-8'}
            fallbackClassName={depth > 0 ? 'text-[8px]' : 'text-[10px]'}
          />
          {hasReplies && (
            <div className="mt-1.5 flex-1 border-l border-border" />
          )}
        </div>
        <div className="min-w-0 flex-1 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/@${comment.author.username}`}
              className="text-sm font-medium hover:underline"
            >
              {comment.author.name ?? comment.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-auto rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditContent(comment.content);
                      setEditing(true);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-0 resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={!editContent.trim()}
                  isLoading={updateComment.isPending}
                  onClick={handleEdit}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {comment.content}
            </p>
          )}

          {user && !editing && (
            <button
              type="button"
              className="mt-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setReplying(!replying)}
            >
              Reply
            </button>
          )}

          {replying && (
            <div className="mt-2 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-0 resize-none text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  disabled={!replyContent.trim()}
                  isLoading={createComment.isPending}
                  onClick={handleReply}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplying(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies with rounded tree connectors */}
      {hasReplies && (
        <div className="ml-4">
          {comment.replies!.map((reply, index) => {
            const isLast = index === comment.replies!.length - 1;
            return (
              <div key={reply.id} className="relative pl-6">
                {!isLast && (
                  <div className="absolute left-0 top-0 h-full border-l border-border" />
                )}
                <div className="absolute left-0 top-0 h-6 w-5 rounded-bl-xl border-b border-l border-border" />
                <CommentItem
                  comment={reply}
                  projectId={projectId}
                  depth={depth + 1}
                />
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your comment will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Comment composer ─── */

export function CommentComposer({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const createComment = useCreateProjectComment(projectId);
  const [content, setContent] = useState('');

  async function handlePost() {
    if (!content.trim()) return;
    await createComment.mutateAsync({ content: content.trim() });
    setContent('');
  }

  if (!user) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Sign in to leave a comment.
        </p>
        <Button size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <UserAvatar
        src={user.avatarUrl}
        name={user.name}
        className="h-8 w-8 shrink-0"
        fallbackClassName="text-[10px]"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!content.trim()}
            onClick={handlePost}
            isLoading={createComment.isPending}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Comments tab (composer + list + pagination) ─── */

interface CommentsTabProps {
  projectId: string;
}

export function CommentsTab({ projectId }: CommentsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProjectComments(projectId, page);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div>
          {data.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Message
              size={20}
              color="currentColor"
              className="text-muted-foreground"
              variant="Linear"
            />
          </div>
          <p className="mt-4 text-sm font-medium">No comments yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Be the first to share your thoughts.
          </p>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  page <= 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map(
              (p) => {
                if (
                  data.meta.totalPages > 5 &&
                  p !== 1 &&
                  p !== data.meta.totalPages &&
                  Math.abs(p - page) > 1
                ) {
                  if (p === 2 || p === data.meta.totalPages - 1) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                );
              },
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((p) => Math.min(data.meta.totalPages, p + 1))
                }
                className={
                  page >= data.meta.totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
