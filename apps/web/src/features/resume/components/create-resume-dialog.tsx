"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateResume, useMyFullProfile } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { profileToResumeData } from "../utils/transform-profile";
import { RESUME_TEMPLATES } from "../templates";
import type { ResumeUserData } from "../templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Loader2, Check } from "lucide-react";

interface CreateResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateResumeDialog({
  open,
  onOpenChange,
}: CreateResumeDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    RESUME_TEMPLATES[0]!.id,
  );
  const router = useRouter();
  const createResume = useCreateResume();
  const { data: profile } = useMyFullProfile();
  const { toast } = useToast();

  async function handleCreate() {
    if (!title.trim()) return;

    const template = RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)!;
    const userData: ResumeUserData = profile
      ? profileToResumeData(profile)
      : {
          name: "Your Name",
          email: "email@example.com",
          socialLinks: [],
          education: [],
          experience: [],
          skills: [],
          services: [],
          projects: [],
        };

    const latexSource = template.generate(userData);

    try {
      const resume = await createResume.mutateAsync({
        title,
        latexSource,
        sections: {
          education: [],
          experience: [],
          skills: [],
          certifications: [],
          customSections: [],
        },
      });
      onOpenChange(false);
      setTitle("");
      router.push(`/resume/${resume.id}`);
    } catch {
      toast({
        title: "Failed to create resume",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Give it a title and pick a template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="resume-title">Title</Label>
            <Input
              id="resume-title"
              placeholder="e.g., Full-Stack Developer Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-2 gap-3">
              {RESUME_TEMPLATES.map((tpl) => (
                <Card
                  key={tpl.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedTemplate === tpl.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate(tpl.id)}
                >
                  <CardContent className="relative flex flex-col items-center gap-1 p-3">
                    {selectedTemplate === tpl.id && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex h-12 w-full items-center justify-center rounded border border-dashed bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium">{tpl.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createResume.isPending || !title.trim()}
          >
            {createResume.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
