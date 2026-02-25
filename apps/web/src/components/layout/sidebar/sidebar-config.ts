import {
  Category,
  Document,
  Element4,
  Home2,
  Kanban,
  Setting2,
  User,
  Archive,
  Notification,
  Send2,
} from 'iconsax-react';
import { Bookmark, Library } from 'lucide-react';

export type NavItem = {
  icon: typeof Element4 | typeof Bookmark;
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
      { icon: Library as never, label: 'Collections', href: '/my-collections' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { icon: Bookmark as never, label: 'Saved', href: '/saved' },
      { icon: Send2, label: 'Invitations', href: '/invitations' },
      { icon: Notification, label: 'Notifications', href: '/notifications' },
    ],
  },
  {
    title: 'System',
    items: [
      { icon: Setting2, label: 'Settings', href: '/settings' },
    ],
  },
];
