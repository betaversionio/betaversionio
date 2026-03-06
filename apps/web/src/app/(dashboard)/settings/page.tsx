"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, changeUsernameSchema, setPasswordSchema, addCustomDomainSchema } from "@betaversionio/shared";
import type { ChangePasswordInput, ChangeUsernameInput, SetPasswordInput, AddCustomDomainInput } from "@betaversionio/shared";
import { useChangePassword, useSetPassword, useChangeUsername, useCheckUsername } from "@/features/auth";
import { useAuth } from "@/providers/auth-provider";
import {
  useMyFullProfile,
  useAddCustomDomain,
  useVerifyCustomDomain,
  useRemoveCustomDomain,
} from "@/hooks/queries/use-profile-queries";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { Monitor, Moon, Sun, CheckCircle2, XCircle, Copy, Check, X, Plus, Trash2, RefreshCw, Globe } from "lucide-react";
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

  // ─── Custom Domains ────────────────────────────────────────────────────────
  const addDomainMutation = useAddCustomDomain();
  const verifyDomainMutation = useVerifyCustomDomain();
  const removeDomainMutation = useRemoveCustomDomain();
  const customDomains = fullProfile?.customDomains ?? [];
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  /** When set, the dialog shows DNS config for this domain instead of the input */
  const [configuringDomain, setConfiguringDomain] = useState<{
    id: string;
    domain: string;
    verified: boolean;
  } | null>(null);

  const domainForm = useForm<AddCustomDomainInput>({
    resolver: zodResolver(addCustomDomainSchema),
    defaultValues: { domain: "" },
  });

  function openAddDialog() {
    setConfiguringDomain(null);
    domainForm.reset();
    setDomainDialogOpen(true);
  }

  function openConfigDialog(d: { id: string; domain: string; verified: boolean }) {
    setConfiguringDomain(d);
    setDomainDialogOpen(true);
  }

  function onAddDomain(data: AddCustomDomainInput) {
    addDomainMutation.mutate(data.domain, {
      onSuccess: (created) => {
        domainForm.reset();
        setConfiguringDomain({ id: created.id, domain: created.domain, verified: false });
      },
      onError: (err) => {
        toast({
          title: "Failed to add domain",
          description: err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        });
      },
    });
  }

  function onVerifyDomain(domainId: string) {
    verifyDomainMutation.mutate(domainId, {
      onSuccess: (result) => {
        if (result.verified) {
          toast({ title: "Domain verified", description: `${result.domain} is now active.` });
          setConfiguringDomain((prev) => prev ? { ...prev, verified: true } : null);
        } else {
          toast({
            title: "Verification failed",
            description: `DNS records not yet pointing to ${portfolioUrl}. Changes can take up to 48 hours to propagate.`,
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({ title: "Verification error", description: "Something went wrong.", variant: "destructive" });
      },
    });
  }

  function onRemoveDomain(domainId: string) {
    removeDomainMutation.mutate(domainId, {
      onSuccess: () => {
        toast({ title: "Domain removed" });
        if (configuringDomain?.id === domainId) {
          setDomainDialogOpen(false);
          setConfiguringDomain(null);
        }
      },
    });
  }

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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Custom Domains</CardTitle>
                <CardDescription>
                  Connect your own domains to your portfolio
                </CardDescription>
              </div>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Domain
              </Button>
            </CardHeader>
            <CardContent>
              {customDomains.length > 0 ? (
                <div className="space-y-2">
                  {customDomains.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <button
                        type="button"
                        className="flex items-center gap-3 min-w-0 text-left"
                        onClick={() => openConfigDialog(d)}
                      >
                        <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {d.domain}
                          </p>
                          {d.verified ? (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid Configuration
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <XCircle className="h-3 w-3" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!d.verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfigDialog(d)}
                          >
                            Configure
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemoveDomain(d.id)}
                          disabled={removeDomainMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8">
                  <Globe className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No custom domains configured
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={openAddDialog}>
                    Add your first domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Add / Configure Domain Dialog ──────────────────────────────────── */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {configuringDomain ? (
            <>
              <DialogHeader>
                <DialogTitle>Configure Domain</DialogTitle>
                <DialogDescription>
                  Set the following DNS record for{" "}
                  <span className="font-medium text-foreground">{configuringDomain.domain}</span>
                </DialogDescription>
              </DialogHeader>

              {/* DNS record table */}
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">CNAME</code>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{configuringDomain.domain}</td>
                      <td className="px-4 py-3 font-mono text-xs">{portfolioUrl}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 rounded-lg border px-4 py-3">
                {configuringDomain.verified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-500">Valid Configuration</p>
                      <p className="text-xs text-muted-foreground">
                        Your domain is correctly pointing to BetaVersion.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">Awaiting DNS Configuration</p>
                      <p className="text-xs text-muted-foreground">
                        Add the CNAME record above in your domain provider&apos;s DNS settings. Changes can take up to 48 hours to propagate.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRemoveDomain(configuringDomain.id)}
                  disabled={removeDomainMutation.isPending}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
                {!configuringDomain.verified && (
                  <Button
                    onClick={() => onVerifyDomain(configuringDomain.id)}
                    disabled={verifyDomainMutation.isPending}
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${verifyDomainMutation.isPending ? "animate-spin" : ""}`} />
                    {verifyDomainMutation.isPending ? "Checking..." : "Verify DNS"}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add Domain</DialogTitle>
                <DialogDescription>
                  Enter the domain you want to connect to your portfolio.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={domainForm.handleSubmit(onAddDomain)}
                className="space-y-4"
              >
                <Field>
                  <FieldLabel htmlFor="domain">Domain</FieldLabel>
                  <Input
                    id="domain"
                    placeholder="portfolio.example.com"
                    {...domainForm.register("domain")}
                  />
                  {domainForm.formState.errors.domain?.message && (
                    <FieldError>
                      {domainForm.formState.errors.domain.message}
                    </FieldError>
                  )}
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" disabled={addDomainMutation.isPending}>
                    {addDomainMutation.isPending ? "Adding..." : "Add Domain"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
