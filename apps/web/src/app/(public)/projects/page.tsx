'use client';

import React from 'react';
import Link from 'next/link';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { ProjectPhase, ProductionType } from '@betaversionio/shared';
import { useProjects } from '@/hooks/queries/use-project-queries';
import { ProjectCard } from '@/features/projects';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Search, Loader2, FolderKanban } from 'lucide-react';

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'likes', label: 'Most Liked' },
] as const;

const searchParams = {
  search: parseAsString.withDefault(''),
  sort: parseAsString.withDefault('latest'),
  phase: parseAsString.withDefault('all'),
  productionType: parseAsString.withDefault('all'),
  page: parseAsInteger.withDefault(1),
};

export default function ProjectsPage() {
  const [{ search, sort, phase, productionType, page }, setParams] =
    useQueryStates(searchParams, { shallow: false });

  const filters = {
    ...(search && { search }),
    sort,
    ...(phase !== 'all' && { phase }),
    ...(productionType !== 'all' && { productionType }),
    page,
    limit: 12,
  };

  const { data, isLoading, error } = useProjects(filters);

  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection
        title="Community"
        highlightedText="Projects"
        description="Discover and explore projects built by the community"
        className="pt-20 pb-14 md:pt-28 md:pb-20"
      >
        {/* Search */}
        <div className="mx-auto mt-6 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setParams({ search: e.target.value, page: 1 })}
              className="rounded-full pl-10 h-12"
            />
          </div>
        </div>
      </HeroSection>

      <div className="container px-4 pt-6 pb-12 md:px-8 md:pt-8 md:pb-16">
        <div className="space-y-6">
          {/* Filters + Sort row */}
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={phase}
                onValueChange={(v) => setParams({ phase: v, page: 1 })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {Object.values(ProjectPhase).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={productionType}
                onValueChange={(v) => setParams({ productionType: v, page: 1 })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(ProductionType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  Failed to load projects. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : !data?.items?.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No projects found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.items.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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
          <h3 className="font-semibold">Have a project of your own?</h3>
          <p className="mt-2 text-muted-foreground">
            Share it with the community and get feedback from fellow developers.{' '}
            <Link
              href="/my-projects/new"
              className="text-primary hover:underline"
            >
              Create a project
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
