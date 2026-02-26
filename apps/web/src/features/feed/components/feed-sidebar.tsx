'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const trendingTopics = [
  { tag: 'react', posts: 1243 },
  { tag: 'nextjs', posts: 892 },
  { tag: 'typescript', posts: 756 },
  { tag: 'rust', posts: 534 },
  { tag: 'ai', posts: 1891 },
];

const topArticles = [
  {
    title: 'Building Scalable APIs with NestJS',
    author: 'Sarah Chen',
    reads: '2.4k',
  },
  {
    title: 'Why Rust is the Future of Systems Programming',
    author: 'Alex Rivera',
    reads: '1.8k',
  },
  {
    title: 'Understanding React Server Components',
    author: 'Priya Sharma',
    reads: '3.1k',
  },
  {
    title: 'The State of CSS in 2026',
    author: 'Jordan Lee',
    reads: '1.2k',
  },
];

const suggestedDevs = [
  { name: 'Emily Zhang', username: 'emilyzhang', role: 'Full-Stack Dev' },
  { name: 'Marcus Cole', username: 'marcuscole', role: 'DevOps Engineer' },
  { name: 'Aisha Patel', username: 'aishap', role: 'ML Engineer' },
];

export function FeedSidebar() {
  return (
    <div className="space-y-4">
      {/* Trending Topics */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Trending Topics</h3>
        <div className="space-y-2.5">
          {trendingTopics.map((topic) => (
            <div key={topic.tag} className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">
                #{topic.tag}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {topic.posts} posts
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Articles */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Top Articles</h3>
        <div className="space-y-3">
          {topArticles.map((article) => (
            <div key={article.title} className="group cursor-pointer">
              <p className="text-sm font-medium leading-snug group-hover:text-primary">
                {article.title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {article.author} &middot; {article.reads} reads
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Suggested Developers */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Developers to Follow</h3>
        <div className="space-y-3">
          {suggestedDevs.map((dev) => (
            <div key={dev.username} className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-[10px]">
                  {dev.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{dev.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {dev.role}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0 rounded-full px-3 text-[11px]"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer links */}
      <div className="px-1">
        <p className="text-[10px] leading-relaxed text-muted-foreground/50">
          About &middot; Help &middot; Privacy &middot; Terms &middot;
          Advertising &middot; BetaVersion.IO &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
