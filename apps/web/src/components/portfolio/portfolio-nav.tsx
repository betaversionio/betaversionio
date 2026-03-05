'use client';

import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/shared/user-avatar';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';
import {
  HambergerMenu,
  CloseSquare,
} from 'iconsax-react';

interface PortfolioNavProps {
  name: string;
  avatarUrl: string | null;
}

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
];

export function PortfolioNav({ name, avatarUrl }: PortfolioNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-200',
        scrolled || mobileOpen
          ? 'border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 rounded-md p-1.5">
          <UserAvatar src={avatarUrl} name={name} className="h-7 w-7" />
          <span className="text-sm font-semibold">{name}</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-center justify-start gap-1 pl-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <CloseSquare size={18} color="currentColor" />
            ) : (
              <HambergerMenu size={18} color="currentColor" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
