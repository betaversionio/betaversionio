'use client';

import { Sidebar, SidebarProvider } from './sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="fixed inset-0 flex bg-background">
        <Sidebar onLogout={onLogout} />
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto px-4 pb-4 pt-20 md:px-6 md:pb-6 md:pt-20 lg:px-8 lg:pb-8 lg:pt-22">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
