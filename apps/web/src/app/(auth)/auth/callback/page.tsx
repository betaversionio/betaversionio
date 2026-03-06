"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth";
import { Loader2 } from "lucide-react";

function OAuthCallbackHandler() {
  const router = useRouter();
  const [success] = useQueryState("success", parseAsString);
  const queryClient = useQueryClient();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    async function handleCallback() {
      try {
        if (!success) {
          router.push("/login?error=auth_failed");
          return;
        }

        // Cookies are already set by the backend redirect — just refetch user
        await queryClient.invalidateQueries({ queryKey: authKeys.me() });
        router.push("/dashboard");
      } catch {
        router.push("/login?error=auth_failed");
      }
    }

    handleCallback();
  }, [router, success, queryClient]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Completing login...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Completing login...</p>
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
