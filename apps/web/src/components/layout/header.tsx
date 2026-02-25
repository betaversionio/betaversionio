'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { ThemeToggle } from '@/components/shared/theme-toggle';
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
} from 'iconsax-react';
import { NotificationBell } from '@/features/notifications/notification-bell';

const navLinks = [
  { href: '/projects', label: 'Projects', icon: Kanban },
  { href: '/collections', label: 'Collections', icon: Book },
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
        scrolled
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-foreground/70 shadow-sm backdrop-blur transition-colors hover:bg-background md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <CloseSquare size={16} />
            ) : (
              <HambergerMenu size={16} />
            )}
          </button>

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative ml-1 h-8 w-8 rounded-full"
                >
                  <UserAvatar
                    src={user.avatarUrl}
                    name={user.name}
                    className="h-7 w-7"
                    fallbackClassName="text-[10px]"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/@${user.username}`}>
                    <UserIcon size={15} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Category size={15} className="mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Setting2 size={15} className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogoutIcon size={15} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <div className="border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={16} />
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
                  <UserIcon size={16} />
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Category size={16} />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Setting2 size={16} />
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
                    <LogoutIcon size={16} className="mr-1.5" />
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
