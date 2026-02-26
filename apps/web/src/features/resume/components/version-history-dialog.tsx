"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, ExternalLink, Clock } from "lucide-react";
import { timeAgo, formatDate } from "@/lib/format";

interface Version {
  id: string;
  pdfUrl: string;
  generatedAt: string;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  versions: Version[];
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  title,
  versions,
}: VersionHistoryDialogProps) {
  const { toast } = useToast();

  function handleCopyLink(url: string) {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title} — Version History</DialogTitle>
        </DialogHeader>

        {versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No published versions yet.
          </p>
        ) : (
          <div className="max-h-80 space-y-0 overflow-y-auto">
            {versions.map((version, i) => (
              <div
                key={version.id}
                className="relative flex items-center justify-between gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Timeline dot + line */}
                <div className="flex items-start gap-3">
                  <div className="relative flex flex-col items-center pt-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                        i === 0
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-background"
                      }`}
                    />
                    {i < versions.length - 1 && (
                      <div className="absolute top-4 h-full w-px bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i === 0 ? "Latest" : `Version ${versions.length - i}`}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span title={formatDate(version.generatedAt, "MMM D, YYYY h:mm A")}>
                        {formatDate(version.generatedAt, "MMM D, YYYY h:mm A")}
                      </span>
                      <span className="text-muted-foreground/60">·</span>
                      <span>{timeAgo(version.generatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleCopyLink(version.pdfUrl)}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    asChild
                  >
                    <a
                      href={version.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
