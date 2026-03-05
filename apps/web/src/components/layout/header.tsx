'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/shared/user-menu';
import {
  HambergerMenu,
  CloseSquare,
  User as UserIcon,
  Category,
  Setting2,
  Logout as LogoutIcon,
  Activity,
  Kanban,
  Book,
  DocumentText,
  Brush2,
} from 'iconsax-react';
import { NotificationBell } from '@/features/notifications/notification-bell';

const navLinks = [
  { href: '/projects', label: 'Projects', icon: Kanban },
  { href: '/blogs', label: 'Blogs', icon: DocumentText },
  { href: '/collections', label: 'Collections', icon: Book },
  { href: '/templates', label: 'Templates', icon: Brush2 },
  { href: '/feed', label: 'Feed', icon: Activity },
];

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
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
        <LogoWithText className="rounded-md p-1.5" />

        {/* Desktop nav links (after logo) */}
        <div className="hidden flex-1 items-center justify-start gap-1 pl-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />

          {/* Mobile menu button */}
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

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                className="h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background shadow-lg transition-all hover:-translate-y-[1px] hover:bg-foreground/90"
                asChild
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={16} color="currentColor" />
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user ? (
              <>
                <div className="my-2 border-t border-border" />
                <Link
                  href={`/@${user.username}`}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserIcon size={16} color="currentColor" />
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Category size={16} color="currentColor" />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Setting2 size={16} color="currentColor" />
                  Settings
                </Link>
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                  >
                    <LogoutIcon
                      size={16}
                      color="currentColor"
                      className="mr-1.5"
                    />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  asChild
                >
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
