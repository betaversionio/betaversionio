"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  useUpdateResume,
  useCompileResume,
  useGeneratePdf,
} from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { LatexEditor } from "./latex-editor";
import { PdfViewer } from "./pdf-viewer";
import { CompilationErrorPanel } from "./compilation-error-panel";
import { ResumeToolbar } from "./resume-toolbar";
import { Code2, Eye } from "lucide-react";
import { GitHubImportDialog } from "./github-import-dialog";
import { GitHubPushDialog } from "./github-push-dialog";

interface ResumeEditorLayoutProps {
  resumeId: string;
  title: string;
  initialSource: string;
  initialGithubRepo?: string | null;
  initialGithubPath?: string | null;
  initialGithubSha?: string | null;
}

export function ResumeEditorLayout({
  resumeId,
  title,
  initialSource,
  initialGithubRepo,
  initialGithubPath,
  initialGithubSha,
}: ResumeEditorLayoutProps) {
  const [latexSource, setLatexSource] = useState(initialSource);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [githubRepo, setGithubRepo] = useState(initialGithubRepo ?? null);
  const [githubPath, setGithubPath] = useState(initialGithubPath ?? null);
  const [githubSha, setGithubSha] = useState(initialGithubSha ?? null);
  const [showImport, setShowImport] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pdfUrlRef = useRef<string | null>(null);

  const updateResume = useUpdateResume(resumeId);
  const compileResume = useCompileResume(resumeId);
  const generatePdf = useGeneratePdf(resumeId);
  const { toast } = useToast();

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateResume.mutateAsync({ latexSource });
      setIsDirty(false);
    } catch {
      toast({
        title: "Failed to save",
        variant: "destructive",
      });
    }
  }, [latexSource, updateResume, toast]);

  const handleChange = useCallback(
    (value: string) => {
      setLatexSource(value);
      setIsDirty(true);

      // Debounced auto-save (5s)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateResume.mutate(
          { latexSource: value },
          {
            onSuccess: () => setIsDirty(false),
          },
        );
      }, 5000);
    },
    [updateResume],
  );

  const handleCompile = useCallback(async () => {
    setErrors([]);
    try {
      const blob = await compileResume.mutateAsync(latexSource);
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      const url = URL.createObjectURL(blob);
      pdfUrlRef.current = url;
      setPdfUrl(url);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Compilation failed";
      try {
        const parsed = JSON.parse(msg);
        if (parsed.errors) {
          setErrors(parsed.errors);
          return;
        }
      } catch {
        // not JSON
      }
      setErrors([msg]);
    }
  }, [latexSource, compileResume]);

  async function handlePublish() {
    // Save first if dirty
    if (isDirty) {
      try {
        await updateResume.mutateAsync({ latexSource });
        setIsDirty(false);
      } catch {
        toast({ title: "Failed to save before publishing", variant: "destructive" });
        return;
      }
    }

    try {
      const version = await generatePdf.mutateAsync();
      if (version.pdfUrl) {
        await navigator.clipboard.writeText(version.pdfUrl);
        toast({
          title: "PDF published! Link copied.",
          description: version.pdfUrl,
        });
      } else {
        toast({ title: "PDF published!" });
      }
    } catch {
      toast({ title: "Failed to publish PDF", variant: "destructive" });
    }
  }

  function handleDownloadPdf() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${title || "resume"}.pdf`;
    a.click();
  }

  function handleGitHubImport(
    content: string,
    repo: string,
    path: string,
    sha: string,
  ) {
    setLatexSource(content);
    setGithubRepo(repo);
    setGithubPath(path);
    setGithubSha(sha);
    setIsDirty(true);

    // Save immediately with GitHub metadata
    updateResume.mutate(
      { latexSource: content, githubRepo: repo, githubPath: path, githubSha: sha },
      {
        onSuccess: () => {
          setIsDirty(false);
          toast({ title: "Imported from GitHub" });
        },
      },
    );
  }

  function handlePushSuccess(repo: string, path: string, sha: string) {
    setGithubRepo(repo);
    setGithubPath(path);
    setGithubSha(sha);

    // Persist GitHub metadata
    updateResume.mutate(
      { githubRepo: repo, githubPath: path, githubSha: sha },
      {
        onSuccess: () =>
          toast({ title: "Pushed to GitHub" }),
      },
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ResumeToolbar
        title={title}
        isDirty={isDirty}
        isCompiling={compileResume.isPending}
        isSaving={updateResume.isPending}
        isPublishing={generatePdf.isPending}
        hasPdf={!!pdfUrl}
        latexSource={latexSource}
        onCompile={handleCompile}
        onSave={handleSave}
        onDownloadPdf={handleDownloadPdf}
        onPublish={handlePublish}
        onGitHubImport={() => setShowImport(true)}
        onGitHubPush={() => setShowPush(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left: Editor */}
        <div className="flex w-1/2 flex-col border-r">
          {/* Panel header */}
          <div className="flex h-8 items-center gap-1.5 border-b bg-muted/40 px-3">
            <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Editor
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <LatexEditor
              value={latexSource}
              onChange={handleChange}
              onCompile={handleCompile}
              onSave={handleSave}
            />
          </div>
          <CompilationErrorPanel
            errors={errors}
            onDismiss={() => setErrors([])}
          />
        </div>

        {/* Right: PDF Preview */}
        <div className="flex w-1/2 flex-col">
          {/* Panel header */}
          <div className="flex h-8 items-center gap-1.5 border-b bg-muted/40 px-3">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Preview
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <PdfViewer
              url={pdfUrl}
              isCompiling={compileResume.isPending}
            />
          </div>
        </div>
      </div>

      <GitHubImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImport={handleGitHubImport}
      />

      <GitHubPushDialog
        open={showPush}
        onOpenChange={setShowPush}
        latexSource={latexSource}
        resumeTitle={title}
        githubRepo={githubRepo}
        githubPath={githubPath}
        githubSha={githubSha}
        onPushSuccess={handlePushSuccess}
      />
    </div>
  );
}
