'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useProjectReviews,
  useCreateProjectReview,
  useDeleteProjectReview,
} from '@/hooks/queries/use-project-queries';
import { useAuth } from '@/providers/auth-provider';
import { timeAgo } from '@/lib/format';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/shared/user-avatar';
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
import { Loader2, Trash2, Star } from 'lucide-react';

interface ReviewsTabProps {
  projectId: string;
  averageRating: number;
  reviewsCount: number;
}

export function ReviewsTab({ projectId, averageRating, reviewsCount }: ReviewsTabProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProjectReviews(projectId, page);
  const createReview = useCreateProjectReview(projectId);
  const deleteReview = useDeleteProjectReview(projectId);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    await createReview.mutateAsync({ rating, title: title.trim(), content: content.trim() });
    setTitle('');
    setContent('');
    setRating(5);
    setShowForm(false);
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        {user && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <StarRating value={rating} onChange={setRating} />
          <Input
            placeholder="Review title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Share your thoughts..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!title.trim() || !content.trim()}
              isLoading={createReview.isPending}
              onClick={handleSubmit}
            >
              Submit Review
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/@${review.author.username}`}>
                    <UserAvatar
                      src={review.author.avatarUrl}
                      name={review.author.name}
                      className="h-8 w-8"
                      fallbackClassName="text-[10px]"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/@${review.author.username}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {review.author.name ?? review.author.username}
                    </Link>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} size={14} readonly />
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {user?.id === review.authorId && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h4 className="mt-2 font-medium">{review.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Star className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">No reviews yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Be the first to review this project.
          </p>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteReview.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
