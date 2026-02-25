'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject, useProjectAnalytics } from '@/hooks/queries/use-project-queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Heart, MessageCircle, Bookmark, Star, ArrowLeft } from 'lucide-react';

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(slug);
  const { data: analytics, isLoading: analyticsLoading } = useProjectAnalytics(
    project?.id ?? '',
  );

  const isLoading = projectLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Analytics not available.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/my-projects">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Views', value: analytics.totals.views, icon: Eye },
    { label: 'Upvotes', value: analytics.totals.upvotes, icon: Heart },
    { label: 'Comments', value: analytics.totals.comments, icon: MessageCircle },
    { label: 'Bookmarks', value: analytics.totals.bookmarks, icon: Bookmark },
    { label: 'Reviews', value: analytics.totals.reviews, icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/my-projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">Analytics — Last 30 days</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics.totals.reviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.totals.averageRating.toFixed(1)}
              <span className="ml-1 text-lg text-muted-foreground">/ 5</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time series - simple table view */}
      <Card>
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.timeSeries.views.length > 0 ? (
            <div className="space-y-1">
              {analytics.timeSeries.views.map(({ date, count }) => (
                <div key={date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{date}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.max(4, (count / Math.max(...analytics.timeSeries.views.map((v) => v.count))) * 200)}px`,
                      }}
                    />
                    <span className="w-8 text-right font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No views data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
