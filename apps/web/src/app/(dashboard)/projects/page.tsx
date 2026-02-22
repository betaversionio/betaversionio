"use client";

import Link from "next/link";
import { useProjects } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, Loader2, ArrowUp, MessageSquare } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function MyProjectsPage() {
  const { data, isLoading, error } = useProjects({ authorId: "me" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and showcase your projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">
              Failed to load projects. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first project to showcase your work
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      {project.logo && (
                        <img
                          src={project.logo}
                          alt=""
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      )}
                      <CardTitle className="line-clamp-1 text-lg">
                        {project.title}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[project.status] ?? ""}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  {project.tagline && (
                    <CardDescription className="line-clamp-2">
                      {project.tagline}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.techStack.length - 4}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="h-3.5 w-3.5" />
                        {project.upvotesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {project.commentsCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
