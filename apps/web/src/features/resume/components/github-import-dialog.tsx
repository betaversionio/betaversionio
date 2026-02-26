"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useGitHubRepos,
  useGitHubContents,
  useGitHubFileContent,
} from "@/hooks/queries";
import type { GitHubRepo, GitHubContentItem } from "@/hooks/queries";
import {
  Loader2,
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

interface GitHubImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (content: string, repo: string, path: string, sha: string) => void;
}

type Step = "repo" | "browse";

export function GitHubImportDialog({
  open,
  onOpenChange,
  onImport,
}: GitHubImportDialogProps) {
  const [step, setStep] = useState<Step>("repo");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const repos = useGitHubRepos(open);
  const contents = useGitHubContents(
    selectedRepo?.owner ?? "",
    selectedRepo?.name ?? "",
    currentPath,
    step === "browse" && !!selectedRepo,
  );
  const fetchFile = useGitHubFileContent();

  function handleSelectRepo(repo: GitHubRepo) {
    setSelectedRepo(repo);
    setCurrentPath("");
    setPathHistory([]);
    setStep("browse");
  }

  function handleNavigate(item: GitHubContentItem) {
    if (item.type === "dir") {
      setPathHistory((prev) => [...prev, currentPath]);
      setCurrentPath(item.path);
    }
  }

  function handleBack() {
    if (pathHistory.length > 0) {
      const prev = pathHistory[pathHistory.length - 1]!;
      setPathHistory((h) => h.slice(0, -1));
      setCurrentPath(prev);
    } else {
      setStep("repo");
      setSelectedRepo(null);
      setCurrentPath("");
    }
  }

  async function handleSelectFile(item: GitHubContentItem) {
    if (!selectedRepo) return;

    try {
      const file = await fetchFile.mutateAsync({
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
        path: item.path,
      });

      onImport(
        file.content,
        `${selectedRepo.owner}/${selectedRepo.name}`,
        file.path,
        file.sha,
      );
      handleClose();
    } catch {
      // error handled by mutation
    }
  }

  function handleClose() {
    onOpenChange(false);
    setStep("repo");
    setSelectedRepo(null);
    setCurrentPath("");
    setPathHistory([]);
  }

  const sortedContents = contents.data
    ? [...contents.data].sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from GitHub</DialogTitle>
          <DialogDescription>
            {step === "repo"
              ? "Select a repository to browse"
              : `Browsing ${selectedRepo?.fullName}${currentPath ? `/${currentPath}` : ""}`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 min-h-[200px] overflow-y-auto">
          {step === "repo" && (
            <>
              {repos.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {repos.data?.map((repo) => (
                <button
                  key={repo.fullName}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted/50"
                  onClick={() => handleSelectRepo(repo)}
                >
                  <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {repo.fullName}
                    </p>
                    {repo.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
              {repos.data?.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No repositories found
                </p>
              )}
            </>
          )}

          {step === "browse" && (
            <>
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {contents.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {sortedContents.map((item) => {
                const isTex =
                  item.type === "file" && item.name.endsWith(".tex");
                return (
                  <button
                    key={item.path}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted/50 disabled:opacity-50"
                    onClick={() =>
                      item.type === "dir"
                        ? handleNavigate(item)
                        : handleSelectFile(item)
                    }
                    disabled={item.type === "file" && !isTex}
                  >
                    {item.type === "dir" ? (
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText
                        className={`h-4 w-4 shrink-0 ${isTex ? "text-emerald-500" : "text-muted-foreground"}`}
                      />
                    )}
                    <span
                      className={`truncate text-sm ${isTex ? "font-medium" : ""}`}
                    >
                      {item.name}
                    </span>
                    {item.type === "dir" && (
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                );
              })}

              {!contents.isLoading && sortedContents.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No files found in this directory
                </p>
              )}
            </>
          )}
        </div>

        {fetchFile.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading file...
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
