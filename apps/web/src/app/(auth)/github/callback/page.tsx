"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function GitHubCallbackHandler() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Processing...");

  useEffect(() => {
    const code = searchParams.get("code");
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    // GitHub App installation callback (setup_action = install/update)
    if (installationId && setupAction) {
      setMessage("Connecting GitHub...");
      apiClient
        .post<{ username: string }>("/github/connect", {
          installationId: Number(installationId),
        })
        .then((result) => {
          setStatus("success");
          setMessage(`Connected as @${result.username}`);
          setTimeout(() => window.close(), 1500);
        })
        .catch(() => {
          setStatus("error");
          setMessage("Failed to connect GitHub. You can close this window.");
        });
      return;
    }

    // OAuth login callback
    if (code && window.opener) {
      window.opener.postMessage(
        { type: "github-oauth-callback", code },
        window.location.origin,
      );
    } else if (!window.opener && !installationId) {
      window.location.href = "/login?error=github_auth_failed";
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      {status === "loading" && (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      )}
      {status === "success" && (
        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      )}
      {status === "error" && <XCircle className="h-8 w-8 text-destructive" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      }
    >
      <GitHubCallbackHandler />
    </Suspense>
  );
}
