"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchUsers } from "@/hooks/queries/use-user-queries";
import { useProjects } from "@/hooks/queries/use-project-queries";
import { useIdeas } from "@/hooks/queries/use-idea-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Users, FolderKanban, Lightbulb } from "lucide-react";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const stageColors: Record<string, string> = {
  CONCEPT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PLANNING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SEEKING_TEAM: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  IN_PROGRESS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  LAUNCHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("developers");

  const {
    data: usersData,
    isLoading: usersLoading,
  } = useSearchUsers(searchQuery || "a"); // Default search to show results

  const {
    data: projectsData,
    isLoading: projectsLoading,
  } = useProjects({ search: searchQuery || undefined });

  const {
    data: ideasData,
    isLoading: ideasLoading,
  } = useIdeas({ search: searchQuery || undefined });

  return (
    <div className="container space-y-6 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Explore
        </h1>
        <p className="mt-2 text-muted-foreground">
          Discover developers, projects, and ideas from the community
        </p>
      </div>

      {/* Search bar */}
      <div className="mx-auto max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search developers, projects, ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="developers" className="gap-2">
              <Users className="h-4 w-4" />
              Developers
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Ideas
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Developers Tab */}
        <TabsContent value="developers">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !usersData?.items?.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No developers found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {usersData.items.map((user) => (
                <Link key={user.id} href={`/u/${user.username}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base">
                          {user.name ?? user.username}
                        </CardTitle>
                        <CardDescription className="truncate">
                          @{user.username}
                        </CardDescription>
                        {user.headline && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {user.headline}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !projectsData?.items?.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No projects found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projectsData.items.map((project) => (
                <Link key={project.id} href={`/u/${project.author.username}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-base">
                          {project.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={statusColors[project.status] ?? ""}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      {project.shortDescription && (
                        <CardDescription className="line-clamp-2">
                          {project.shortDescription}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <Badge
                              key={tech}
                              variant="outline"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {project.techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.techStack.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={project.author.avatarUrl ?? undefined}
                            />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(project.author.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {project.author.username}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ideas Tab */}
        <TabsContent value="ideas">
          {ideasLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !ideasData?.items?.length ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No ideas found
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ideasData.items.map((idea) => (
                <Card key={idea.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
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
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {idea.techStack.slice(0, 3).map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {idea.voteCount} votes
                        </span>
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={idea.author.avatarUrl ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(idea.author.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
