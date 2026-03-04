import {
  DocumentText,
  Document,
  Home2,
  Kanban,
  People,
  User,
  Setting2,
} from 'iconsax-react';
import { Library } from 'lucide-react';

export type NavItem = {
  icon: typeof Home2 | typeof Library;
  label: string;
  href?: string;
  exactMatch?: boolean;
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    items: [
      { icon: Home2, label: 'Home', href: '/feed' },
      { icon: People, label: 'Network', href: '/network' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { icon: Kanban, label: 'Projects', href: '/my-projects' },
      { icon: Document, label: 'Blogs', href: '/my-blogs' },
      { icon: Library as never, label: 'Collections', href: '/my-collections' },
      { icon: DocumentText, label: 'Resume', href: '/resume' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', href: '/profile', exactMatch: true },
      { icon: Setting2, label: 'Settings', href: '/settings' },
    ],
  },
];
