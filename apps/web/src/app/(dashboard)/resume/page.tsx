'use client';

import { useState } from 'react';
import { useResumes } from '@/hooks/queries';
import { PageHeader } from '@/components/shared/page-header';
import { ResumeCard, CreateResumeDialog } from '@/features/resume';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Loader2 } from 'lucide-react';

export default function ResumesPage() {
  const { data: resumes, isLoading } = useResumes();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resumes?.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Resume Builder"
          description="Create and manage your LaTeX resumes."
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Create your first resume</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Write LaTeX, compile to PDF, and download — like Overleaf, built
              into BetaVersion.IO.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Button>
          </CardContent>
        </Card>

        <CreateResumeDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Builder"
        description="Create and manage your LaTeX resumes."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Resume
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            id={resume.id}
            title={resume.title}
            isPrimary={resume.isPrimary}
            versions={resume.versions}
          />
        ))}
      </div>

      <CreateResumeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
