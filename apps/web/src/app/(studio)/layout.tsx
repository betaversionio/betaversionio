'use client';

import { AuthGuard } from '@/components/layout/auth-guard';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
