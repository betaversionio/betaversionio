"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIdeaSchema, IdeaStage } from "@devcom/shared";
import type { CreateIdeaInput } from "@devcom/shared";
import { useIdeas, useCreateIdea, useToggleVote } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Lightbulb,
  Plus,
  TriangleIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";

const stageColors: Record<string, string> = {
  CONCEPT:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PLANNING:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SEEKING_TEAM:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  IN_PROGRESS:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LAUNCHED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
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

export default function IdeaBoardPage() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [techInput, setTechInput] = useState("");

  const filters = {
    ...(stageFilter && stageFilter !== "ALL" ? { stage: stageFilter } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  const { data, isLoading } = useIdeas(filters);
  const createIdea = useCreateIdea();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateIdeaInput>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      title: "",
      description: "",
      stage: IdeaStage.CONCEPT,
      techStack: [],
      roles: [],
    },
  });

  const formStage = watch("stage");
  const techStack = watch("techStack");

  function addTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = techInput.trim();
      if (value && !techStack.includes(value)) {
        setValue("techStack", [...techStack, value]);
      }
      setTechInput("");
    }
  }

  function removeTech(tech: string) {
    setValue(
      "techStack",
      techStack.filter((t) => t !== tech),
    );
  }

  async function onSubmit(data: CreateIdeaInput) {
    try {
      await createIdea.mutateAsync(data);
      toast({ title: "Idea shared!", description: "Your idea is now live." });
      setCreateOpen(false);
      reset();
    } catch (error) {
      toast({
        title: "Failed to share idea",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Idea Board</h1>
          <p className="text-muted-foreground">
            Share ideas, find collaborators, and build together
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Share an Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Share a New Idea</DialogTitle>
              <DialogDescription>
                Describe your idea and find people to build it with
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea-title">Title</Label>
                <Input
                  id="idea-title"
                  placeholder="AI-powered code review tool"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idea-desc">Description</Label>
                <Textarea
                  id="idea-desc"
                  placeholder="Describe your idea in detail..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Stage</Label>
                <Select
                  value={formStage}
                  onValueChange={(v) => setValue("stage", v as IdeaStage)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(IdeaStage).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add technologies (press Enter)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={addTech}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createIdea.isPending}>
                  {createIdea.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Share Idea
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter || "ALL"} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stages</SelectItem>
            {Object.values(IdeaStage).map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ideas List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No ideas yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share an idea!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.items.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({
  idea,
}: {
  idea: {
    id: string;
    title: string;
    description: string;
    stage: string;
    techStack: string[];
    author: {
      id: string;
      username: string;
      name: string | null;
      avatarUrl: string | null;
    };
    voteCount: number;
    hasVoted: boolean;
  };
}) {
  const toggleVote = useToggleVote(idea.id);

  return (
    <Card className="flex">
      {/* Vote column */}
      <div className="flex flex-col items-center justify-start border-r px-3 py-4">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${idea.hasVoted ? "text-primary" : ""}`}
          onClick={() => toggleVote.mutate()}
        >
          <TriangleIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{idea.voteCount}</span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">
              {idea.title}
            </CardTitle>
            <Badge
              variant="secondary"
              className={stageColors[idea.stage] ?? ""}
            >
              {idea.stage.replace(/_/g, " ")}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {idea.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {idea.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {idea.techStack.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{idea.techStack.length - 4}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={idea.author.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(idea.author.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {idea.author.name ?? idea.author.username}
              </span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
