'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyTemplates } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyTemplateCard } from '@/features/templates';
import { Plus, Loader2 } from 'lucide-react';
import { Brush2 } from 'iconsax-react';

const statusFilters = ['All', 'Draft', 'Published'] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function MyTemplatesPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');

  const { data, isLoading, error } = useMyTemplates({
    ...(activeFilter !== 'All' && { status: activeFilter }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Templates"
        description="Manage your portfolio templates."
      >
        <Button asChild>
          <Link href="/my-templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </PageHeader>

      <Tabs
        value={activeFilter}
        onValueChange={(v) => setActiveFilter(v as StatusFilter)}
      >
        <TabsList>
          {statusFilters.map((status) => (
            <TabsTrigger key={status} value={status}>
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">
              Failed to load templates. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : !data?.items?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brush2
              size={48}
              className="mb-4 text-muted-foreground"
              color="currentColor"
              variant="Linear"
            />
            <h3 className="text-lg font-semibold">
              {activeFilter === 'All'
                ? 'No templates yet'
                : `No ${activeFilter.toLowerCase()} templates`}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {activeFilter === 'All'
                ? 'Create your first template for the marketplace'
                : `You don\u2019t have any templates with ${activeFilter.toLowerCase()} status`}
            </p>
            {activeFilter === 'All' && (
              <Button asChild>
                <Link href="/my-templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((template) => (
            <MyTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
