'use client';

import React from 'react';
import Link from 'next/link';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useTemplates } from '@/hooks/queries/use-template-queries';
import { TemplateCard } from '@/features/templates/components/template-card';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSection } from '@/components/ui/hero-section';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Search, Loader2, Layout } from 'lucide-react';

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
] as const;

const searchParams = {
  search: parseAsString.withDefault(''),
  sort: parseAsString.withDefault('popular'),
  page: parseAsInteger.withDefault(1),
};

export default function TemplatesPage() {
  const [{ search, sort, page }, setParams] = useQueryStates(searchParams, {
    shallow: false,
  });

  const filters = {
    ...(search && { search }),
    sort,
    ...(sort === 'featured' && { featured: true }),
    page,
    limit: 12,
  };

  const { data, isLoading, error } = useTemplates(filters);

  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection
        title="Community"
        highlightedText="Templates"
        description="Browse portfolio templates built by the community"
        className="pt-20 pb-14 md:pt-28 md:pb-20"
      >
        {/* Search */}
        <div className="mx-auto mt-6 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setParams({ search: e.target.value, page: 1 })}
              className="rounded-full pl-10 h-12"
            />
          </div>
        </div>
      </HeroSection>

      <div className="container px-4 pt-6 pb-12 md:px-8 md:pt-8 md:pb-16">
        <div className="space-y-6">
          {/* Sort tabs */}
          <div className="flex items-center justify-end">
            <Tabs
              value={sort}
              onValueChange={(v) => setParams({ sort: v, page: 1 })}
            >
              <TabsList>
                {sortOptions.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
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
                <Layout className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.items.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setParams({ page: Math.max(1, page - 1) })
                        }
                        className={
                          page <= 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - page) <= 1,
                      )
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && arr[i - 1]! < p - 1 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              isActive={p === page}
                              onClick={() => setParams({ page: p })}
                              className="cursor-pointer"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setParams({ page: Math.min(totalPages, page + 1) })
                        }
                        className={
                          page >= totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-lg border p-6">
          <h3 className="font-semibold">Want to create a template?</h3>
          <p className="mt-2 text-muted-foreground">
            Build a portfolio template and share it with the community.{' '}
            <Link
              href="/docs/templates"
              className="text-primary hover:underline"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
