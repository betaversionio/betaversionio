"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createResumeSchema } from "@devcom/shared";
import type { CreateResumeInput } from "@devcom/shared";
import { useResumes, useCreateResume } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from '@/components/shared/page-header';
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Pencil,
  Download,
  Loader2,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
} from "lucide-react";

export default function ResumeBuilderPage() {
  const { data: resumes, isLoading } = useResumes();
  const createResume = useCreateResume();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");

  // Resume editor form
  const form = useForm<CreateResumeInput>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      title: "",
      sections: {
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        customSections: [],
      },
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control: form.control, name: "sections.education" });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control: form.control, name: "sections.experience" });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control: form.control, name: "sections.skills" });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control: form.control,
    name: "sections.certifications",
  });

  async function handleCreateResume() {
    if (!resumeTitle.trim()) return;
    try {
      await createResume.mutateAsync({
        title: resumeTitle,
        sections: {
          education: [],
          experience: [],
          skills: [],
          certifications: [],
          customSections: [],
        },
      });
      toast({ title: "Resume created" });
      setCreateOpen(false);
      setResumeTitle("");
    } catch (error) {
      toast({
        title: "Failed to create resume",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No resumes yet
  if (!resumes?.length && !editingId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Resume Builder"
          description="Create and manage your developer resumes."
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              Create your first resume
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Build a professional developer resume to showcase your skills
            </p>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Resume
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Resume</DialogTitle>
                  <DialogDescription>
                    Give your resume a title to get started.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="resume-title">Title</Label>
                  <Input
                    id="resume-title"
                    placeholder="e.g., Full-Stack Developer Resume"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateResume}
                    disabled={createResume.isPending || !resumeTitle.trim()}
                  >
                    {createResume.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resume editor
  if (editingId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Resume"
          description="Add your education, experience, skills, and certifications."
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Back to List
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </PageHeader>

        <Tabs defaultValue="experience">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="experience">
              <Briefcase className="mr-2 h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Education
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Wrench className="mr-2 h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="mr-2 h-4 w-4" />
              Certifications
            </TabsTrigger>
          </TabsList>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            {expFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExp(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input
                        {...form.register(`sections.experience.${index}.company`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Position</Label>
                      <Input
                        {...form.register(`sections.experience.${index}.position`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input
                        {...form.register(`sections.experience.${index}.location`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        {...form.register(`sections.experience.${index}.startDate`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        {...form.register(`sections.experience.${index}.endDate`)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      {...form.register(
                        `sections.experience.${index}.description`,
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                appendExp({
                  company: "",
                  position: "",
                  startDate: "",
                  current: false,
                  highlights: [],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-4">
            {eduFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEdu(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Institution</Label>
                      <Input
                        {...form.register(
                          `sections.education.${index}.institution`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Degree</Label>
                      <Input
                        {...form.register(`sections.education.${index}.degree`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Field of Study</Label>
                      <Input
                        {...form.register(
                          `sections.education.${index}.fieldOfStudy`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        {...form.register(
                          `sections.education.${index}.startDate`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        {...form.register(
                          `sections.education.${index}.endDate`,
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      {...form.register(
                        `sections.education.${index}.description`,
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                appendEdu({
                  institution: "",
                  degree: "",
                  startDate: "",
                  current: false,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label>Skill Name</Label>
                  <Input
                    {...form.register(`sections.skills.${index}.name`)}
                  />
                </div>
                <div className="w-40 space-y-1">
                  <Label>Level</Label>
                  <Input
                    placeholder="Expert, Advanced..."
                    {...form.register(`sections.skills.${index}.level`)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => appendSkill({ name: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            {certFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex justify-between">
                    <h4 className="font-medium">
                      Certification #{index + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCert(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input
                        {...form.register(
                          `sections.certifications.${index}.name`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Issuer</Label>
                      <Input
                        {...form.register(
                          `sections.certifications.${index}.issuer`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        {...form.register(
                          `sections.certifications.${index}.issueDate`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        {...form.register(
                          `sections.certifications.${index}.expiryDate`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Credential ID</Label>
                      <Input
                        {...form.register(
                          `sections.certifications.${index}.credentialId`,
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Credential URL</Label>
                      <Input
                        {...form.register(
                          `sections.certifications.${index}.credentialUrl`,
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                appendCert({ name: "", issuer: "", issueDate: "" })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </TabsContent>
        </Tabs>

        {/* Preview placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              A preview of your resume will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">
                Resume preview coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resume list
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Builder"
        description="Create and manage your developer resumes."
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Resume</DialogTitle>
              <DialogDescription>
                Give your resume a title to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="resume-title">Title</Label>
              <Input
                id="resume-title"
                placeholder="e.g., Full-Stack Developer Resume"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateResume}
                disabled={createResume.isPending || !resumeTitle.trim()}
              >
                {createResume.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes?.map((resume) => (
          <Card key={resume.id}>
            <CardHeader>
              <CardTitle className="text-lg">{resume.title}</CardTitle>
              <CardDescription>
                Last updated:{" "}
                {new Date(resume.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(resume.id)}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
