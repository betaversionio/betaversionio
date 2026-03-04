'use client';

import { useAuth } from '@/providers/auth-provider';
import { AuthGuard } from '@/components/layout/auth-guard';
import { DashboardLayout } from '@/components/layout';

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <DashboardLayout onLogout={() => logout()}>{children}</DashboardLayout>
    </AuthGuard>
  );
}
