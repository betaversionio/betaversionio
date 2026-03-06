'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  useResumes,
  useDeleteResume,
  useSetPrimaryResume,
  useUnsetPrimaryResume,
  useCompileResume,
  type Resume,
} from '@/hooks/queries';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/shared/page-header';
import { CreateResumeDialog, VersionHistoryDialog } from '@/features/resume';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DataTableColumnHeader,
  ServerDataTableContent,
} from '@/components/ui/data-table';
import {
  FileText,
  Plus,
  Loader2,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  Link2,
  History,
  Download,
} from 'lucide-react';

dayjs.extend(relativeTime);

function ActionsCell({ resume }: { resume: Resume }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const deleteResume = useDeleteResume();
  const setPrimary = useSetPrimaryResume();
  const unsetPrimary = useUnsetPrimaryResume();
  const compileResume = useCompileResume(resume.id);
  const { toast } = useToast();

  const latestVersion = resume.versions[0];

  async function handleDownloadPdf() {
    if (!resume.latexSource) {
      toast({ title: 'No LaTeX source to compile', variant: 'destructive' });
      return;
    }
    try {
      const blob = await compileResume.mutateAsync(resume.latexSource);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title || 'resume'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Failed to compile PDF', variant: 'destructive' });
    }
  }

  async function handleDelete() {
    try {
      await deleteResume.mutateAsync(resume.id);
      toast({ title: 'Resume deleted' });
    } catch {
      toast({ title: 'Failed to delete resume', variant: 'destructive' });
    }
  }

  async function handleTogglePrimary() {
    try {
      if (resume.isPrimary) {
        await unsetPrimary.mutateAsync(resume.id);
        toast({ title: 'Resume unset as primary' });
      } else {
        await setPrimary.mutateAsync(resume.id);
        toast({ title: 'Resume set as primary' });
      }
    } catch {
      toast({ title: 'Failed to update primary status', variant: 'destructive' });
    }
  }

  function handleCopyLink() {
    if (latestVersion) {
      navigator.clipboard.writeText(latestVersion.pdfUrl);
      toast({ title: 'Link copied to clipboard' });
    }
  }

  const isToggling = setPrimary.isPending || unsetPrimary.isPending;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link href={`/resume/${resume.id}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleTogglePrimary}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Star className={`h-3.5 w-3.5 ${resume.isPrimary ? 'fill-amber-500 text-amber-500' : ''}`} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{resume.isPrimary ? 'Unset primary' : 'Set as primary'}</TooltipContent>
        </Tooltip>

        {latestVersion && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCopyLink}
                >
                  <Link2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy PDF link</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={latestVersion.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open PDF</TooltipContent>
            </Tooltip>
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownloadPdf}
              disabled={compileResume.isPending || !resume.latexSource}
            >
              {compileResume.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download PDF</TooltipContent>
        </Tooltip>

        {resume.versions.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Version history ({resume.versions.length})</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleteResume.isPending}
            >
              {deleteResume.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>

      <VersionHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        title={resume.title}
        versions={resume.versions}
      />
    </TooltipProvider>
  );
}

const columns: ColumnDef<Resume>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <Link
        href={`/resume/${row.original.id}`}
        className="flex items-center gap-2 font-medium hover:underline"
      >
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        {row.original.title}
        {row.original.isPrimary && (
          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-500" />
        )}
      </Link>
    ),
  },
  {
    id: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    enableSorting: false,
    cell: ({ row }) => {
      const hasVersions = row.original.versions.length > 0;
      return (
        <Badge
          variant="secondary"
          className={
            hasVersions
              ? 'bg-emerald-400/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
              : 'bg-amber-400/20 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
          }
        >
          {hasVersions ? 'Published' : 'Draft'}
        </Badge>
      );
    },
  },
  {
    id: 'versions',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Versions" />,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.versions.length}</span>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {dayjs(row.original.updatedAt).fromNow()}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell resume={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];

export default function ResumesPage() {
  const { data: resumes, isLoading } = useResumes();
  const [createOpen, setCreateOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const data = useMemo(() => resumes ?? [], [resumes]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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

      <ServerDataTableContent
        table={table}
        columnCount={columns.length}
      />

      <CreateResumeDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
