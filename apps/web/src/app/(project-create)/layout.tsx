'use client';

import { AuthGuard } from '@/components/layout/auth-guard';

export default function ProjectCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
