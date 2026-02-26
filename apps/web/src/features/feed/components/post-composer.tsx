'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, PostType } from '@betaversionio/shared';
import type { CreatePostInput } from '@betaversionio/shared';
import { useCreatePost } from '../hooks';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CloseCircle,
  Hashtag,
  Gallery,
  VideoPlay,
  Code1,
  Send2,
} from 'iconsax-react';
import { postTypeLabels } from '../config';

const quickActions: {
  icon: typeof Gallery;
  color: string;
  label: string;
  postType?: PostType;
}[] = [
  { icon: Gallery, color: '#4ade80', label: 'Photo' },
  { icon: VideoPlay, color: '#60a5fa', label: 'Video' },
  { icon: Code1, color: '#f59e0b', label: 'Code', postType: PostType.Snippet },
  {
    icon: Hashtag,
    color: '#a78bfa',
    label: 'Article',
    postType: PostType.Article,
  },
];

function QuickActionButton({
  icon: Icon,
  color,
  label,
  onClick,
}: {
  icon: typeof Gallery;
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-2 rounded-lg text-xs font-normal text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <Icon size={22} color={color} variant="Bulk" />
      {label}
    </Button>
  );
}

export function PostComposer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createPost = useCreatePost();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      type: PostType.Text,
      content: '',
      hashtags: [],
    },
  });

  const postType = watch('type');
  const hashtags = watch('hashtags') ?? [];
  const content = watch('content');

  function addHashtag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = hashtagInput.trim().replace(/^#/, '');
      if (value && !hashtags.includes(value)) {
        setValue('hashtags', [...hashtags, value]);
      }
      setHashtagInput('');
    }
  }

  function removeHashtag(tag: string) {
    setValue(
      'hashtags',
      hashtags.filter((t) => t !== tag),
    );
  }

  async function onSubmit(data: CreatePostInput) {
    try {
      await createPost.mutateAsync(data);
      reset();
      setIsExpanded(false);
      setHashtagInput('');
      toast({ title: 'Post published' });
    } catch (error) {
      toast({
        title: 'Failed to publish',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="rounded-xl p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-3">
          <UserAvatar
            src={user?.avatarUrl}
            name={user?.name}
            className="h-10 w-10 shrink-0"
            fallbackClassName="text-xs"
          />

          <div className="min-w-0 flex-1">
            {!isExpanded ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="w-full rounded-full border px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  What&apos;s on your mind?
                </button>
                <div className="flex items-center gap-1">
                  {quickActions.map((action) => (
                    <QuickActionButton
                      key={action.label}
                      icon={action.icon}
                      color={action.color}
                      label={action.label}
                      onClick={() => {
                        setIsExpanded(true);
                        if (action.postType) setValue('type', action.postType);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="What's on your mind?"
                  rows={3}
                  autoFocus
                  className="resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-xs text-destructive">
                    {errors.content.message}
                  </p>
                )}

                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 rounded-full px-2.5 py-0.5 text-xs font-normal"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                        >
                          <CloseCircle
                            size={12}
                            color="currentColor"
                            className="opacity-60 hover:opacity-100"
                          />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Select
                      value={postType}
                      onValueChange={(v) => setValue('type', v as PostType)}
                    >
                      <SelectTrigger className="h-8 w-auto gap-1.5 rounded-full border-none bg-muted px-3 text-xs shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PostType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {postTypeLabels[type] ?? type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-green-500"
                    >
                      <Gallery size={16} color="currentColor" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-blue-500"
                    >
                      <VideoPlay size={16} color="currentColor" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-amber-500"
                    >
                      <Code1 size={16} color="currentColor" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-violet-500"
                    >
                      <Hashtag size={16} color="currentColor" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => {
                        reset();
                        setIsExpanded(false);
                        setHashtagInput('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 rounded-full px-4 text-xs"
                      disabled={!content?.trim()}
                      isLoading={createPost.isPending}
                    >
                      <Send2
                        size={14}
                        color="currentColor"
                        className="mr-1.5"
                      />
                      Post
                    </Button>
                  </div>
                </div>

                {/* Hashtag input */}
                <Input
                  placeholder="Add hashtags (press Enter)"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={addHashtag}
                  className="h-8 rounded-full border-dashed text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
