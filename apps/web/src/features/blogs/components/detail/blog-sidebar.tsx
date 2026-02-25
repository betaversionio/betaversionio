'use client';

import { useState } from 'react';
import type { Blog } from '@/hooks/queries/use-blog-queries';
import { useToggleBlogVote } from '@/hooks/queries/use-blog-queries';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Link2, Check, Eye } from 'lucide-react';
import { Heart, Message } from 'iconsax-react';

interface BlogFloatingBarProps {
  blog: Blog;
  commentsCount: number;
}

export function BlogFloatingBar({ blog, commentsCount }: BlogFloatingBarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const toggleVote = useToggleBlogVote(blog.id);
  const hasVoted = blog.hasVoted ?? false;
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/blogs/${blog.slug}`
      : `/blogs/${blog.slug}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  }

  function scrollToComments() {
    document
      .getElementById('blog-comments')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-full"
              disabled={!user || toggleVote.isPending}
              onClick={() => toggleVote.mutate({ value: 1 })}
            >
              <Heart
                size={18}
                color="currentColor"
                variant={hasVoted ? 'Bold' : 'Linear'}
              />
              {blog.upvotesCount}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {hasVoted ? 'Remove upvote' : 'Upvote'}
          </TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={scrollToComments}
            >
              <Message size={18} color="currentColor" variant="Linear" />
              {commentsCount}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Comments</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-default items-center gap-1 px-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{blog.viewsCount}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">Views</TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={copyLink}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {copied ? 'Copied!' : 'Copy link'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
