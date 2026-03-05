'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  useTemplate,
  useSelectTemplate,
} from '@/hooks/queries/use-template-queries';
import { useMyFullProfile } from '@/hooks/queries/use-profile-queries';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown2 } from 'iconsax-react';
import { Loader2, ExternalLink, Github, Check } from 'lucide-react';
import { Markdown } from '@/components/ui/markdown';
import { HeroBackground } from '@/components/ui/hero-background';

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const { data: template, isLoading, error } = useTemplate(id);
  const { data: profile } = useMyFullProfile();
  const selectTemplate = useSelectTemplate();
  const { toast } = useToast();

  const isCurrentTemplate = profile?.profile?.portfolioTemplateId === id;

  function handleSelect() {
    selectTemplate.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Template selected',
          description: `"${template?.name}" is now your active portfolio template.`,
        });
      },
      onError: (err) => {
        toast({
          title: 'Failed to select template',
          description:
            err instanceof Error ? err.message : 'Something went wrong.',
          variant: 'destructive',
        });
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container px-4 py-32 text-center md:px-8">
        <h2 className="text-lg font-semibold">Template not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The template you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/templates">Browse Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <HeroBackground>
      <div className="container px-4 pt-24 pb-16 md:px-8 md:pt-26">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header + Actions */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{template.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <UserAvatar
                    src={template.author.avatarUrl}
                    name={template.author.name}
                    className="h-6 w-6"
                    fallbackClassName="text-xs"
                  />
                  <Link
                    href={`/@${template.author.username}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {template.author.name ?? template.author.username}
                  </Link>
                </div>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ArrowDown2 size={14} color="currentColor" variant="Linear" />
                  {template.installCount} installs
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.previewUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={template.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Live Preview
                  </a>
                </Button>
              )}
              {template.repoUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={template.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-1.5 h-4 w-4" />
                    View Source
                  </a>
                </Button>
              )}
              {isAuthenticated ? (
                isCurrentTemplate ? (
                  <Button disabled>
                    <Check className="mr-1.5 h-4 w-4" />
                    Currently Active
                  </Button>
                ) : (
                  <Button
                    onClick={handleSelect}
                    disabled={selectTemplate.isPending}
                  >
                    {selectTemplate.isPending
                      ? 'Selecting...'
                      : 'Use This Template'}
                  </Button>
                )
              ) : (
                <Button asChild>
                  <Link href="/login">Sign in to Use</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Preview image */}
          {template.previewImage ? (
            <div className="overflow-hidden rounded-lg border">
              <img
                src={template.previewImage}
                alt={template.name}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-muted">
              <span className="text-muted-foreground">
                No preview available
              </span>
            </div>
          )}

          {/* Description */}
          <Card>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
              <Markdown content={template.description} size="sm" />
            </CardContent>
          </Card>
        </div>
      </div>
    </HeroBackground>
  );
}
