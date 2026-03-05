'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { People } from 'iconsax-react';
import type { PortfolioTemplate } from '@/hooks/queries/use-template-queries';

interface TemplateCardProps {
  template: PortfolioTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/templates/${template.id}`}
        className="absolute inset-0 z-10"
      />

      {/* Preview image */}
      {template.previewImage ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={template.previewImage}
            alt={template.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">No preview</span>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">
          {template.name}
        </CardTitle>
        {template.description && (
          <CardDescription className="line-clamp-2">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardContent className="mt-auto border-t py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserAvatar
              src={template.author.avatarUrl}
              name={template.author.name}
              className="h-5 w-5"
              fallbackClassName="text-[10px]"
            />
            <span className="text-xs text-muted-foreground">
              {template.author.username}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <People size={14} color="currentColor" variant="Linear" />
            {template.installCount} users
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
