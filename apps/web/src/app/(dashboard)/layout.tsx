"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayout } from "@/components/layout";
import { Refresh } from "iconsax-react";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        "/login?callbackUrl=" + encodeURIComponent(window.location.pathname),
      );
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Refresh size={32} color="currentColor" className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout onLogout={() => logout()}>
      {children}
    </DashboardLayout>
  );
}
