'use client';

import { useAuth } from '@/providers/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { FolderKanban, Eye, Rss, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Projects',
    value: '4',
    description: 'Active projects',
    icon: FolderKanban,
  },
  {
    title: 'Resume Views',
    value: '128',
    description: 'Last 30 days',
    icon: Eye,
  },
  {
    title: 'Posts',
    value: '12',
    description: 'Published posts',
    icon: Rss,
  },
];

const recentActivity = [
  {
    id: '1',
    action: 'Published a new post',
    description: 'How I built a real-time collaboration tool',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    action: 'Updated project',
    description: 'BetaVersion.IO - Added new features section',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    action: 'Received 5 upvotes',
    description: 'On your idea: AI-powered code review tool',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    action: 'Resume viewed',
    description: 'Your resume was viewed 12 times today',
    timestamp: '1 day ago',
  },
  {
    id: '5',
    action: 'New follower',
    description: 'jane_dev started following you',
    timestamp: '2 days ago',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? user?.username}`}
        description="Here's an overview of your developer profile activity."
      />

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest actions and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
