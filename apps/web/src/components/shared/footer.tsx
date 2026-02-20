import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { siteConfig } from '@/config/site';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  GithubIcon,
  NewTwitterIcon,
  DiscordIcon,
} from '@hugeicons/core-free-icons';

export function Footer() {
  return (
    <footer className="relative">
      <div
        className={cn(
          'mx-auto max-w-5xl lg:border-x',
          'dark:bg-[radial-gradient(35%_80%_at_25%_0%,var(--tw-gradient-from),transparent)] dark:from-foreground/10',
        )}
      >
        <div className="absolute inset-x-0 h-px w-full bg-border" />
        <div className="grid max-w-5xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
            <LogoWithText
              logoClassName="h-8 w-8"
              textClassName="text-md"
              className="w-max"
            />
            <p className="max-w-sm text-balance text-sm text-muted-foreground">
              The developer identity platform. Your portfolio, resume, projects,
              feed, and ideas — unified under one subdomain.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item, index) => (
                <Button
                  asChild
                  key={`social-${index}`}
                  size="icon-sm"
                  variant="outline"
                >
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <HugeiconsIcon icon={item.icon} size={14} />
                    <span className="sr-only">{item.label}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-xs text-muted-foreground">Platform</span>
            <div className="mt-2 flex flex-col gap-2">
              {platform.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-xs text-muted-foreground">Company</span>
            <div className="mt-2 flex flex-col gap-2">
              {company.map(({ href, title }) => (
                <Link
                  className="w-max text-sm hover:underline"
                  href={href}
                  key={title}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 h-px w-full bg-border" />
        <div className="mx-auto flex max-w-4xl flex-col justify-between items-center gap-2 py-4 w-full">
          <p className="text-center text-sm font-light text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

const platform = [
  { title: 'Explore', href: '/explore' },
  { title: 'Feed', href: '/feed' },
  { title: 'Ideas', href: '/ideas' },
  { title: 'Resume Builder', href: '/resume' },
];

const company = [
  { title: 'About', href: '#' },
  { title: 'Blog', href: '#' },
  { title: 'Privacy Policy', href: '#' },
  { title: 'Terms of Service', href: '#' },
];

const socialLinks = [
  {
    icon: GithubIcon,
    link: siteConfig.links.github,
    label: 'GitHub',
  },
  {
    icon: NewTwitterIcon,
    link: siteConfig.links.twitter,
    label: 'Twitter',
  },
  {
    icon: DiscordIcon,
    link: siteConfig.links.discord,
    label: 'Discord',
  },
];
