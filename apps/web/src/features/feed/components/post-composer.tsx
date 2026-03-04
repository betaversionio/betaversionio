'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, PostType } from '@betaversionio/shared';
import type { CreatePostInput } from '@betaversionio/shared';
import { useCreatePost } from '../hooks';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/queries/use-project-queries';
import { useBlogs } from '@/hooks/queries/use-blog-queries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Kanban,
  Document,
} from 'iconsax-react';
import { Search } from 'lucide-react';
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

function AttachProjectPopover({
  onSelect,
}: {
  onSelect: (title: string, slug: string) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data } = useProjects(
    { authorId: user?.id, limit: 50, status: 'Published' },
    { enabled: open && !!user?.id },
  );

  const items = data?.items ?? [];
  const filtered = search
    ? items.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
            >
              <Kanban size={16} color="currentColor" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Attach Project</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto px-1 pb-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No projects found
            </p>
          ) : (
            filtered.map((project) => (
              <button
                key={project.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(project.title, project.slug);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {project.logo ? (
                  <img
                    src={project.logo}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                ) : (
                  <Kanban
                    size={16}
                    color="currentColor"
                    className="shrink-0 text-muted-foreground"
                  />
                )}
                <span className="truncate">{project.title}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AttachBlogPopover({
  onSelect,
}: {
  onSelect: (title: string, slug: string) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data } = useBlogs(
    { authorId: user?.id, limit: 50, status: 'Published' },
    { enabled: open && !!user?.id },
  );

  const items = data?.items ?? [];
  const filtered = search
    ? items.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
            >
              <Document size={16} color="currentColor" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Attach Blog</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto px-1 pb-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No blogs found
            </p>
          ) : (
            filtered.map((blog) => (
              <button
                key={blog.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(blog.title, blog.slug);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                ) : (
                  <Document
                    size={16}
                    color="currentColor"
                    className="shrink-0 text-muted-foreground"
                  />
                )}
                <span className="truncate">{blog.title}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PostComposer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createPost = useCreatePost();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');

  const {
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

  function appendEmbed(slug: string, prefix: string) {
    const iframe = `<iframe src="/embed${prefix}/${slug}" width="100%" height="160" style="border:none; border-radius:8px;" loading="lazy"></iframe>`;
    const current = content ?? '';
    const newContent = current ? `${current}\n\n${iframe}` : iframe;
    setValue('content', newContent);
  }

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

  const extraToolbarActions = (
    <>
      <AttachProjectPopover
        onSelect={(_title, slug) => appendEmbed(slug, '/projects')}
      />
      <AttachBlogPopover
        onSelect={(_title, slug) => appendEmbed(slug, '/blogs')}
      />
    </>
  );

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
                <MarkdownEditor
                  value={content ?? ''}
                  onChange={(val) => setValue('content', val)}
                  placeholder="What's on your mind?"
                  outputFormat="markdown"
                  height={150}
                  maxHeight={300}
                  extraToolbarActions={extraToolbarActions}
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
