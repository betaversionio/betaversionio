"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompilationErrorPanelProps {
  errors: string[];
  onDismiss: () => void;
}

export function CompilationErrorPanel({
  errors,
  onDismiss,
}: CompilationErrorPanelProps) {
  if (errors.length === 0) return null;

  return (
    <div className="border-t border-destructive/20 bg-destructive/5">
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-medium text-destructive">
            {errors.length} error{errors.length > 1 ? "s" : ""}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <pre className="max-h-28 overflow-auto border-t border-destructive/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-destructive/90">
        {errors.join("\n")}
      </pre>
    </div>
  );
}
