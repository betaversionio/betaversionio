'use client';

import { SidebarShell } from '@/components/ui/sidebar';
import { SidebarNavItem } from '@/components/layout/sidebar/sidebar-nav-item';
import type { NavItem } from '@/components/layout/sidebar/sidebar-config';
import {
  ArrowLeft2,
  User,
  DocumentText1,
  Link21,
  Code1,
  Briefcase,
  Teacher,
  Setting2,
} from 'iconsax-react';

const tabs: NavItem[] = [
  {
    href: '/feed',
    label: 'Back to Feed',
    icon: ArrowLeft2,
  },
  { href: '/profile', label: 'Profile', icon: User, exactMatch: true },
  { href: '/profile/about', label: 'About', icon: DocumentText1 },
  { href: '/profile/social-links', label: 'Social Links', icon: Link21 },
  { href: '/profile/tech-stack', label: 'Tech Stack', icon: Code1 },
  { href: '/profile/experience', label: 'Experience', icon: Briefcase },
  { href: '/profile/education', label: 'Education', icon: Teacher },
  { href: '/profile/services', label: 'Services', icon: Setting2 },
];

export function ProfileEditSidebar() {
  return (
    <SidebarShell>
      <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {tabs.map((tab) => (
          <SidebarNavItem key={tab.href} item={tab} />
        ))}
      </nav>
    </SidebarShell>
  );
}
