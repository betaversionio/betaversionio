'use client';

import { useState } from 'react';
import {
  useProjectUpdates,
  useCreateProjectUpdate,
  useDeleteProjectUpdate,
} from '@/hooks/queries/use-project-queries';
import { useAuth } from '@/providers/auth-provider';
import { formatDate } from '@/lib/format';
import { Markdown } from '@/components/ui/markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, FileText } from 'lucide-react';

interface UpdatesTabProps {
  projectId: string;
  isOwner: boolean;
}

export function UpdatesTab({ projectId, isOwner }: UpdatesTabProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProjectUpdates(projectId, page);
  const createUpdate = useCreateProjectUpdate(projectId);
  const deleteUpdate = useDeleteProjectUpdate(projectId);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    await createUpdate.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      version: version.trim() || undefined,
    });
    setTitle('');
    setContent('');
    setVersion('');
    setShowForm(false);
  }

  return (
    <div className="mt-6 space-y-6">
      {isOwner && user && !showForm && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(true)}>
            Post Update
          </Button>
        </div>
      )}

      {showForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Update title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="v1.0.0 (optional)"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-32"
            />
          </div>
          <Textarea
            placeholder="What's new? Supports markdown..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={!title.trim() || !content.trim()}
              isLoading={createUpdate.isPending}
              onClick={handleSubmit}
            >
              Publish
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 h-full w-px bg-border" />
          {data.items.map((update) => (
            <div key={update.id} className="relative flex gap-4 pb-8">
              <div className="relative z-10 mt-1.5 h-6 w-6 shrink-0 rounded-full border-2 border-primary bg-background" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{update.title}</h4>
                    <div className="mt-0.5 flex items-center gap-2">
                      {update.version && (
                        <Badge variant="secondary" className="text-xs">
                          {update.version}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteUpdate.mutate(update.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <Markdown content={update.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">No updates yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isOwner ? 'Share progress with your audience.' : 'Check back later for updates.'}
          </p>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
