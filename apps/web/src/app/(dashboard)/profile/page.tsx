"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  updateSocialLinksSchema,
  updateTechStackSchema,
  SocialPlatform,
  TechCategory,
  Proficiency,
} from "@devcom/shared";
import type {
  UpdateProfileInput,
  UpdateSocialLinksInput,
  UpdateTechStackInput,
} from "@devcom/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { authKeys } from "@/hooks/queries";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

export default function EditProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Profile Form ---
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      bio: "",
      headline: "",
      location: "",
      website: "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiClient.patch("/users/me/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  // --- Social Links Form ---
  const socialForm = useForm<UpdateSocialLinksInput>({
    resolver: zodResolver(updateSocialLinksSchema),
    defaultValues: {
      links: [{ platform: SocialPlatform.GITHUB, url: "" }],
    },
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control: socialForm.control,
    name: "links",
  });

  const socialMutation = useMutation({
    mutationFn: (data: UpdateSocialLinksInput) =>
      apiClient.patch("/users/me/social-links", data),
    onSuccess: () => {
      toast({ title: "Social links updated" });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update social links.",
        variant: "destructive",
      });
    },
  });

  // --- Tech Stack Form ---
  const techForm = useForm<UpdateTechStackInput>({
    resolver: zodResolver(updateTechStackSchema),
    defaultValues: {
      items: [
        { name: "", category: TechCategory.LANGUAGE, proficiency: Proficiency.INTERMEDIATE },
      ],
    },
  });

  const {
    fields: techFields,
    append: appendTech,
    remove: removeTech,
  } = useFieldArray({
    control: techForm.control,
    name: "items",
  });

  const techMutation = useMutation({
    mutationFn: (data: UpdateTechStackInput) =>
      apiClient.patch("/users/me/tech-stack", data),
    onSuccess: () => {
      toast({ title: "Tech stack updated" });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update tech stack.",
        variant: "destructive",
      });
    },
  });

  // --- Avatar placeholder ---
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your public developer profile
        </p>
      </div>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Upload a profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>
            <div>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) =>
                  setAvatarFile(e.target.files?.[0] ?? null)
                }
                className="max-w-xs"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, or WebP. Max 10MB.
                {avatarFile && (
                  <span className="ml-2 font-medium">
                    Selected: {avatarFile.name}
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Basic information about you that will be visible on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((data) =>
              profileMutation.mutate(data)
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="Full-stack developer passionate about open source"
                {...profileForm.register("headline")}
              />
              {profileForm.formState.errors.headline && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.headline.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell the world about yourself..."
                rows={4}
                {...profileForm.register("bio")}
              />
              {profileForm.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  {...profileForm.register("location")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yoursite.com"
                  {...profileForm.register("website")}
                />
              </div>
            </div>

            <Button type="submit" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Add links to your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={socialForm.handleSubmit((data) =>
              socialMutation.mutate(data)
            )}
            className="space-y-4"
          >
            {socialFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3">
                <div className="w-40">
                  <Label>Platform</Label>
                  <Select
                    value={socialForm.watch(`links.${index}.platform`)}
                    onValueChange={(value) =>
                      socialForm.setValue(
                        `links.${index}.platform`,
                        value as SocialPlatform,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SocialPlatform).map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://..."
                    {...socialForm.register(`links.${index}.url`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSocial(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSocial({ platform: SocialPlatform.GITHUB, url: "" })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Link
            </Button>

            <div className="pt-2">
              <Button type="submit" disabled={socialMutation.isPending}>
                {socialMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Social Links"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
          <CardDescription>
            List the technologies you work with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={techForm.handleSubmit((data) =>
              techMutation.mutate(data)
            )}
            className="space-y-4"
          >
            {techFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Name</Label>
                  <Input
                    placeholder="React"
                    {...techForm.register(`items.${index}.name`)}
                  />
                </div>
                <div className="w-36">
                  <Label>Category</Label>
                  <Select
                    value={techForm.watch(`items.${index}.category`)}
                    onValueChange={(value) =>
                      techForm.setValue(
                        `items.${index}.category`,
                        value as TechCategory,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TechCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-36">
                  <Label>Proficiency</Label>
                  <Select
                    value={techForm.watch(`items.${index}.proficiency`)}
                    onValueChange={(value) =>
                      techForm.setValue(
                        `items.${index}.proficiency`,
                        value as Proficiency,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Proficiency).map((prof) => (
                        <SelectItem key={prof} value={prof}>
                          {prof}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTech(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendTech({
                  name: "",
                  category: TechCategory.LANGUAGE,
                  proficiency: Proficiency.INTERMEDIATE,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Technology
            </Button>

            <div className="pt-2">
              <Button type="submit" disabled={techMutation.isPending}>
                {techMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Tech Stack"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
