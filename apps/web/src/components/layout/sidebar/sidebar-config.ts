import {
  Category,
  Document,
  Element4,
  Home2,
  Kanban,
  Setting2,
  User,
} from 'iconsax-react';

export type NavItem = {
  icon: typeof Element4;
  label: string;
  href: string;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    items: [
      { icon: Home2, label: 'Home', href: '/feed' },
    ],
  },
  {
    title: 'Overview',
    items: [
      { icon: Category, label: 'Dashboard', href: '/dashboard' },
      { icon: User, label: 'My Profile', href: '/profile' },
    ],
  },
  {
    title: 'Work',
    items: [
      { icon: Kanban, label: 'Projects', href: '/my-projects' },
      { icon: Document, label: 'Resume', href: '/resume' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Setting2, label: 'Settings', href: '/settings' },
    ],
  },
];
