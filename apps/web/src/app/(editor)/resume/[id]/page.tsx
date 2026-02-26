"use client";

import { use } from "react";
import { useResume } from "@/hooks/queries";
import { ResumeEditorLayout } from "@/features/resume";
import { Loader2 } from "lucide-react";

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: resume, isLoading } = useResume(id);

  if (isLoading || !resume) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-dvh">
      <ResumeEditorLayout
        resumeId={resume.id}
        title={resume.title}
        initialSource={resume.latexSource ?? ""}
        initialGithubRepo={resume.githubRepo}
        initialGithubPath={resume.githubPath}
        initialGithubSha={resume.githubSha}
      />
    </div>
  );
}
