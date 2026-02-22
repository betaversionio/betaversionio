"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function GitHubCallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && window.opener) {
      window.opener.postMessage(
        { type: "github-oauth-callback", code },
        window.location.origin,
      );
    } else if (!window.opener) {
      // If opened directly (not as popup), redirect to login
      window.location.href = "/login?error=github_auth_failed";
    }
  }, [searchParams]);

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
