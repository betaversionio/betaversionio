"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, changeUsernameSchema, setPasswordSchema } from "@betaversionio/shared";
import type { ChangePasswordInput, ChangeUsernameInput, SetPasswordInput } from "@betaversionio/shared";
import { useChangePassword, useSetPassword, useChangeUsername, useCheckUsername } from "@/features/auth";
import { useAuth } from "@/providers/auth-provider";
import { useMyFullProfile } from "@/hooks/queries/use-profile-queries";
import { useTemplate, useSelectTemplate } from "@/hooks/queries/use-template-queries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { Monitor, Moon, Sun, CheckCircle2, XCircle, Copy, Check, X } from "lucide-react";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const changePasswordMutation = useChangePassword();
  const setPasswordMutation = useSetPassword();
  const changeUsernameMutation = useChangeUsername();
  const { toast } = useToast();
  const hasPassword = user?.hasPassword ?? true;

  const { data: fullProfile } = useMyFullProfile();
  const selectedTemplateId = fullProfile?.profile?.portfolioTemplateId ?? null;
  const { data: selectedTemplate } = useTemplate(selectedTemplateId ?? "");
  const selectTemplateMutation = useSelectTemplate();
  const [copied, setCopied] = useState(false);

  const portfolioUrl = user?.username
    ? `${user.username}.betaversion.io`
    : "";

  const copyPortfolioUrl = useCallback(() => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [portfolioUrl]);

  function handleRemoveTemplate() {
    selectTemplateMutation.mutate(null, {
      onSuccess: () => {
        toast({
          title: "Template removed",
          description: "Your portfolio template has been removed.",
        });
      },
      onError: (err) => {
        toast({
          title: "Failed to remove template",
          description:
            err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        });
      },
    });
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const setPasswordForm = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const usernameForm = useForm<ChangeUsernameInput>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: {
      username: user?.username ?? "",
    },
  });

  const watchedUsername = useWatch({ control: usernameForm.control, name: "username" });
  const debouncedUsername = useDebounce(watchedUsername || "", 500);
  const usernameQuery = useCheckUsername(debouncedUsername);
  const isUsernameUnchanged = watchedUsername === user?.username;
  const showUsernameCheck =
    debouncedUsername.length >= 3 &&
    !usernameForm.formState.errors.username &&
    !isUsernameUnchanged &&
    debouncedUsername === watchedUsername;

  function onChangeUsername(data: ChangeUsernameInput) {
    changeUsernameMutation.mutate(data.username, {
      onSuccess: () => {
        toast({
          title: "Username changed",
          description: "Your username has been updated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to change username",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  }

  function onSetPassword(data: SetPasswordInput) {
    setPasswordMutation.mutate(data.password, {
      onSuccess: () => {
        toast({
          title: "Password set",
          description: "You can now log in with your email and password.",
        });
        setPasswordForm.reset();
      },
      onError: (error) => {
        toast({
          title: "Failed to set password",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  }

  function onChangePassword(data: ChangePasswordInput) {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully.",
        });
        reset();
      },
      onError: (error) => {
        toast({
          title: "Failed to change password",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences."
      />

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Username</CardTitle>
              <CardDescription>
                Update your unique username
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={usernameForm.handleSubmit(onChangeUsername)}
                className="space-y-4"
              >
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    autoComplete="username"
                    {...usernameForm.register("username")}
                  />
                  {usernameForm.formState.errors.username?.message ? (
                    <FieldError>
                      {usernameForm.formState.errors.username.message}
                    </FieldError>
                  ) : showUsernameCheck ? (
                    <div className="flex items-center gap-1.5 text-xs mt-1">
                      {usernameQuery.isLoading ? (
                        <span className="text-muted-foreground">
                          Checking...
                        </span>
                      ) : usernameQuery.data?.available ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">
                            Username available
                          </span>
                        </>
                      ) : usernameQuery.data ? (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-destructive">
                            Username taken
                          </span>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </Field>

                <Button
                  type="submit"
                  disabled={
                    changeUsernameMutation.isPending ||
                    isUsernameUnchanged ||
                    (showUsernameCheck && !usernameQuery.data?.available)
                  }
                >
                  {changeUsernameMutation.isPending
                    ? "Changing..."
                    : "Change Username"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Email</CardTitle>
              <CardDescription>
                Update the email address associated with your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="new-email">New Email</FieldLabel>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="newemail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button disabled>Update Email</Button>
              <p className="text-xs text-muted-foreground">
                Email change functionality coming soon.
              </p>
            </CardContent>
          </Card>

          {hasPassword ? (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onChangePassword)}
                  className="space-y-4"
                >
                  <Field>
                    <FieldLabel htmlFor="currentPassword">
                      Current Password
                    </FieldLabel>
                    <PasswordInput
                      id="currentPassword"
                      autoComplete="current-password"
                      {...register("currentPassword")}
                    />
                    <FieldError>{errors.currentPassword?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <PasswordInput
                      id="newPassword"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      {...register("newPassword")}
                    />
                    <FieldError>{errors.newPassword?.message}</FieldError>
                  </Field>

                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Set Password</CardTitle>
                <CardDescription>
                  Add a password so you can also log in with your email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={setPasswordForm.handleSubmit(onSetPassword)}
                  className="space-y-4"
                >
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <PasswordInput
                      id="password"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      {...setPasswordForm.register("password")}
                    />
                    <FieldError>
                      {setPasswordForm.formState.errors.password?.message}
                    </FieldError>
                  </Field>

                  <Button
                    type="submit"
                    disabled={setPasswordMutation.isPending}
                  >
                    {setPasswordMutation.isPending
                      ? "Setting..."
                      : "Set Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Separator />

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Account deletion is not yet available. Contact support if
                needed.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Select your preferred color theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex h-auto flex-col gap-2 py-4"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex h-auto flex-col gap-2 py-4"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex h-auto flex-col gap-2 py-4"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Notification settings coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Template</CardTitle>
              <CardDescription>
                Choose a community template for your portfolio site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplateId && selectedTemplate ? (
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  {selectedTemplate.previewImage ? (
                    <img
                      src={selectedTemplate.previewImage}
                      alt={selectedTemplate.name}
                      className="h-20 w-32 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-32 items-center justify-center rounded-md bg-muted">
                      <span className="text-xs text-muted-foreground">
                        No preview
                      </span>
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{selectedTemplate.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {selectedTemplate.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/templates">Change</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveTemplate}
                        disabled={selectTemplateMutation.isPending}
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8">
                  <p className="text-sm text-muted-foreground">
                    No template selected
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/templates">Browse Templates</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio URL</CardTitle>
              <CardDescription>
                Your personal portfolio is available at this address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm">
                  {portfolioUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyPortfolioUrl}
                  disabled={!portfolioUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
