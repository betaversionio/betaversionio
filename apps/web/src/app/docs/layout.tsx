'use client';

import { SidebarProvider } from '@/components/layout/sidebar/sidebar-context';
import { SidebarShell } from '@/components/ui/sidebar';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { DocsHeader } from '@/components/docs/docs-header';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-background">
        <SidebarShell>
          <DocsSidebar />
        </SidebarShell>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DocsHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-12 pt-20 md:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 py-6 text-neutral-800 dark:text-neutral-300 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
