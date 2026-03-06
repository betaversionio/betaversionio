'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  Code1,
  DocumentText,
  People,
  Setting2,
  MessageQuestion,
  Shield,
} from 'iconsax-react';

const exploreTags = [
  'javascript',
  'typescript',
  'react',
  'nextjs',
  'nodejs',
  'python',
  'rust',
  'go',
  'devops',
  'ai',
  'opensource',
  'webdev',
];

const quickLinks = [
  { label: 'My Projects', href: '/projects', icon: Code1 },
  { label: 'My Blog', href: '/blog', icon: DocumentText },
  { label: 'Community', href: '/community', icon: People },
  { label: 'Settings', href: '/settings', icon: Setting2 },
];

const footerLinks = [
  { label: 'Help', href: '/help' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export function FeedSidebar() {
  return (
    <div className="space-y-4">
      {/* Explore Tags */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Explore Topics</h3>
        <div className="flex flex-wrap gap-1.5">
          {exploreTags.map((tag) => (
            <span
              key={tag}
              className="cursor-pointer rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
        <div className="space-y-1">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Icon size={16} color="currentColor" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Community Guidelines */}
      <Card className="rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold">Community</h3>
        <div className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
          <div className="flex gap-2">
            <MessageQuestion
              size={14}
              color="currentColor"
              className="mt-0.5 shrink-0"
            />
            <p>
              Share your work, ask questions, and help others grow as
              developers.
            </p>
          </div>
          <div className="flex gap-2">
            <Shield
              size={14}
              color="currentColor"
              className="mt-0.5 shrink-0"
            />
            <p>
              Be respectful and constructive. We&apos;re all here to learn and
              build together.
            </p>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <div className="px-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground"
            >
              {link.label}
            </Link>
          ))}
          <span className="text-[10px] text-muted-foreground/50">
            &middot; DevCom &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}
