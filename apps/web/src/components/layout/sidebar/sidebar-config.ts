import { Category, Document, Home2, Kanban } from 'iconsax-react';
import { Library } from 'lucide-react';

export type NavItem = {
  icon: typeof Home2 | typeof Library;
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
      { icon: Category, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Work',
    items: [
      { icon: Kanban, label: 'Projects', href: '/my-projects' },
      { icon: Document, label: 'Blogs', href: '/my-blogs' },
      { icon: Library as never, label: 'Collections', href: '/my-collections' },
    ],
  },
];
