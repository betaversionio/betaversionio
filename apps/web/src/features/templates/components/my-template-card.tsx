import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { People } from 'iconsax-react';
import type { PortfolioTemplate } from '@/hooks/queries/use-template-queries';

const statusColors: Record<string, string> = {
  Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface MyTemplateCardProps {
  template: PortfolioTemplate;
}

export function MyTemplateCard({ template }: MyTemplateCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-shadow hover:shadow-md">
      <Link
        href={`/templates/${template.id}`}
        className="absolute inset-0 z-0"
      />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {template.previewImage && (
              <img
                src={template.previewImage}
                alt=""
                className="h-8 w-8 rounded-md object-cover"
              />
            )}
            <CardTitle className="line-clamp-1 text-lg">
              {template.name}
            </CardTitle>
          </div>
          <Badge
            variant="secondary"
            className={statusColors[template.status] ?? ''}
          >
            {template.status}
          </Badge>
        </div>
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
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <People size={16} color="currentColor" variant="Linear" />
            {template.installCount} users
          </span>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative z-10 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Link href={`/my-templates/${template.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
