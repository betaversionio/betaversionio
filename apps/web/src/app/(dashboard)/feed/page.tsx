"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, PostType, ReactionType } from "@devcom/shared";
import type { CreatePostInput } from "@devcom/shared";
import {
  useFeed,
  useCreatePost,
  useToggleReaction,
} from "@/hooks/queries";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  PartyPopper,
  Lightbulb,
  HelpCircle,
  HandHeart,
  MessageCircle,
  Loader2,
  Send,
  X,
} from "lucide-react";

const reactionIcons: Record<string, React.ElementType> = {
  LIKE: Heart,
  CELEBRATE: PartyPopper,
  INSIGHTFUL: Lightbulb,
  CURIOUS: HelpCircle,
  SUPPORT: HandHeart,
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();
  const createPost = useCreatePost();
  const [hashtagInput, setHashtagInput] = useState("");

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
      type: PostType.TEXT,
      content: "",
      hashtags: [],
    },
  });

  const postType = watch("type");
  const hashtags = watch("hashtags") ?? [];

  function addHashtag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = hashtagInput.trim().replace(/^#/, "");
      if (value && !hashtags.includes(value)) {
        setValue("hashtags", [...hashtags, value]);
      }
      setHashtagInput("");
    }
  }

  function removeHashtag(tag: string) {
    setValue(
      "hashtags",
      hashtags.filter((t) => t !== tag),
    );
  }

  async function onSubmitPost(data: CreatePostInput) {
    try {
      await createPost.mutateAsync(data);
      reset();
      toast({ title: "Post published" });
    } catch (error) {
      toast({
        title: "Failed to publish post",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  // Infinite scroll observer
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
        <p className="text-muted-foreground">
          Share updates, articles, and code snippets with the community
        </p>
      </div>

      {/* Post Composer */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <Select
                value={postType}
                onValueChange={(v) => setValue("type", v as PostType)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PostType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="What's on your mind?"
              rows={3}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}

            {/* Hashtags */}
            <div>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add hashtags (press Enter)"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={addHashtag}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Feed Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : allPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No posts yet. Be the first to share something!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            ) : hasNextPage ? (
              <p className="text-sm text-muted-foreground">Scroll for more</p>
            ) : allPosts.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
}: {
  post: {
    id: string;
    type: string;
    content: string;
    title: string | null;
    hashtags: string[];
    author: {
      id: string;
      username: string;
      name: string | null;
      avatarUrl: string | null;
    };
    reactions: Array<{ type: string; count: number; hasReacted: boolean }>;
    commentCount: number;
    createdAt: string;
  };
}) {
  const toggleReaction = useToggleReaction(post.id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback>
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {post.author.name ?? post.author.username}
            </p>
            <p className="text-xs text-muted-foreground">
              @{post.author.username} &middot; {timeAgo(post.createdAt)}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {post.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {post.title && (
          <h3 className="mb-2 font-semibold">{post.title}</h3>
        )}
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        {post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-1">
            {Object.values(ReactionType).map((type) => {
              const reaction = post.reactions.find((r) => r.type === type);
              const Icon = reactionIcons[type] ?? Heart;
              const count = reaction?.count ?? 0;
              const hasReacted = reaction?.hasReacted ?? false;

              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${hasReacted ? "text-primary" : ""}`}
                  onClick={() =>
                    toggleReaction.mutate({ type: type as ReactionType })
                  }
                >
                  <Icon className="mr-1 h-3.5 w-3.5" />
                  {count > 0 && (
                    <span className="text-xs">{count}</span>
                  )}
                </Button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <MessageCircle className="mr-1 h-3.5 w-3.5" />
            <span className="text-xs">{post.commentCount}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
