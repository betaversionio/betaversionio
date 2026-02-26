"use client";

import { useState, useEffect, type FormEvent } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGitHubRepos,
  usePushToGitHub,
} from "@/hooks/queries";
import type { GitHubRepo } from "@/hooks/queries";
import { Folder, ChevronRight, Loader2 } from "lucide-react";

interface GitHubPushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latexSource: string;
  resumeTitle: string;
  githubRepo: string | null;
  githubPath: string | null;
  githubSha: string | null;
  onPushSuccess: (repo: string, path: string, sha: string) => void;
}

export function GitHubPushDialog({
  open,
  onOpenChange,
  latexSource,
  resumeTitle,
  githubRepo,
  githubPath,
  githubSha,
  onPushSuccess,
}: GitHubPushDialogProps) {
  const [step, setStep] = useState<"repo" | "details">(
    githubRepo ? "details" : "repo",
  );
  const [selectedRepo, setSelectedRepo] = useState<string | null>(githubRepo);
  const [filePath, setFilePath] = useState(
    githubPath ||
      `${(resumeTitle || "resume").replace(/\s+/g, "-").toLowerCase()}.tex`,
  );
  const [commitMessage, setCommitMessage] = useState(
    githubSha ? "Update resume" : "Add resume",
  );

  const repos = useGitHubRepos(open && step === "repo");
  const push = usePushToGitHub();

  useEffect(() => {
    if (open) {
      if (githubRepo) {
        setStep("details");
        setSelectedRepo(githubRepo);
        setFilePath(
          githubPath ||
            `${(resumeTitle || "resume").replace(/\s+/g, "-").toLowerCase()}.tex`,
        );
        setCommitMessage(githubSha ? "Update resume" : "Add resume");
      } else {
        setStep("repo");
        setSelectedRepo(null);
        setFilePath(
          `${(resumeTitle || "resume").replace(/\s+/g, "-").toLowerCase()}.tex`,
        );
        setCommitMessage("Add resume");
      }
    }
  }, [open, githubRepo, githubPath, githubSha, resumeTitle]);

  function handleSelectRepo(repo: GitHubRepo) {
    setSelectedRepo(repo.fullName);
    setStep("details");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRepo || !filePath.trim() || !commitMessage.trim()) return;

    const [owner, repo] = selectedRepo.split("/");
    if (!owner || !repo) return;

    try {
      const result = await push.mutateAsync({
        owner,
        repo,
        path: filePath,
        content: latexSource,
        message: commitMessage,
        sha:
          selectedRepo === githubRepo ? (githubSha ?? undefined) : undefined,
      });

      onPushSuccess(selectedRepo, result.path, result.sha);
      onOpenChange(false);
    } catch {
      // error shown via push.isError
    }
  }

  // Repo picker step — use plain Dialog
  if (step === "repo") {
    return (
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Push to GitHub"
        submitLabel=""
        onSubmit={(e) => e.preventDefault()}
      >
        <p className="text-sm text-muted-foreground">
          Select a repository to push your resume to
        </p>
        <div className="max-h-72 overflow-y-auto">
          {repos.isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {repos.data?.map((repo) => (
            <button
              key={repo.fullName}
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted/50"
              onClick={() => handleSelectRepo(repo)}
            >
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{repo.fullName}</p>
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
        </div>
      </FormDialog>
    );
  }

  // Details step — use FormDialog with form fields
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Push to ${selectedRepo}`}
      submitLabel="Push"
      isPending={push.isPending}
      onSubmit={handleSubmit}
      className="sm:max-w-md"
    >
      {!githubRepo && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => setStep("repo")}
        >
          Change repository
        </Button>
      )}

      <div className="space-y-2">
        <Label htmlFor="file-path">File path</Label>
        <Input
          id="file-path"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="resume.tex"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commit-message">Commit message</Label>
        <Input
          id="commit-message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Update resume"
          required
        />
      </div>

      {push.isError && (
        <p className="text-sm text-destructive">
          {push.error instanceof Error
            ? push.error.message
            : "Failed to push to GitHub"}
        </p>
      )}
    </FormDialog>
  );
}
