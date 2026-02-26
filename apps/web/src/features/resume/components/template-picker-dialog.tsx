"use client";

import { RESUME_TEMPLATES } from "../templates";
import type { ResumeUserData } from "../templates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: ResumeUserData;
  onSelect: (latexSource: string, templateId: string) => void;
}

export function TemplatePickerDialog({
  open,
  onOpenChange,
  userData,
  onSelect,
}: TemplatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Pick a starting template. Your profile data will be pre-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {RESUME_TEMPLATES.map((tpl) => (
            <Card
              key={tpl.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => {
                const source = tpl.generate(userData);
                onSelect(source, tpl.id);
                onOpenChange(false);
              }}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="flex h-16 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{tpl.name}</span>
                <span className="text-center text-xs text-muted-foreground">
                  {tpl.description}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
