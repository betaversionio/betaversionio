"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken, apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

function GitHubCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    async function handleCallback() {
      try {
        const accessToken = searchParams.get("access_token");

        if (!accessToken) {
          router.push("/login?error=github_auth_failed");
          return;
        }

        setAccessToken(accessToken);
        await apiClient.get("/auth/me");
        router.push("/dashboard");
      } catch {
        router.push("/login?error=github_auth_failed");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Completing login...</p>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Completing login...</p>
        </div>
      }
    >
      <GitHubCallbackHandler />
    </Suspense>
  );
}
