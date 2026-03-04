'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/layout/auth-guard';
import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { ProfileEditSidebar } from '@/features/profile';

const tabMeta: Record<string, { title: string; description: string }> = {
  '/profile': {
    title: 'Profile',
    description:
      'Basic information about you that will be visible on your public profile',
  },
  '/profile/about': {
    title: 'About',
    description: 'Write a detailed bio using markdown',
  },
  '/profile/social-links': {
    title: 'Social Links',
    description: 'Add links to your social media profiles',
  },
  '/profile/tech-stack': {
    title: 'Tech Stack',
    description: 'List the technologies you work with',
  },
  '/profile/experience': {
    title: 'Experience',
    description: 'Add your work experience',
  },
  '/profile/education': {
    title: 'Education',
    description: 'Add your educational background',
  },
  '/profile/services': {
    title: 'Services',
    description: 'List the services you offer as a developer',
  },
};

export default function ProfileEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = tabMeta[pathname] ?? { title: 'Profile', description: '' };

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="fixed inset-0 flex bg-background">
          <ProfileEditSidebar />
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto px-4 pb-10 pt-20 md:px-6 md:pb-12 md:pt-20 lg:px-8 lg:pb-16 lg:pt-22">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {meta.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
