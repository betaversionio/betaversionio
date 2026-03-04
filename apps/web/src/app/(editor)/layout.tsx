'use client';

import { AuthGuard } from '@/components/layout/auth-guard';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="fixed inset-0 bg-background">{children}</div>
    </AuthGuard>
  );
}
