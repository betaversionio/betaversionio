'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCustomDomainSchema } from '@betaversionio/shared';
import type { AddCustomDomainInput } from '@betaversionio/shared';
import { useAuth } from '@/providers/auth-provider';
import {
  useMyFullProfile,
  useAddCustomDomain,
  useVerifyCustomDomain,
  useRemoveCustomDomain,
} from '@/hooks/queries/use-profile-queries';
import {
  useTemplate,
  useSelectTemplate,
} from '@/hooks/queries/use-template-queries';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Copy,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function PortfolioTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: fullProfile } = useMyFullProfile();
  const selectedTemplateId = fullProfile?.profile?.portfolioTemplateId ?? null;
  const { data: selectedTemplate } = useTemplate(selectedTemplateId ?? '');
  const selectTemplateMutation = useSelectTemplate();
  const [copied, setCopied] = useState(false);

  // ─── Custom Domains ────────────────────────────────────────────────────────
  const addDomainMutation = useAddCustomDomain();
  const verifyDomainMutation = useVerifyCustomDomain();
  const removeDomainMutation = useRemoveCustomDomain();
  const customDomains = fullProfile?.customDomains ?? [];
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [configuringDomain, setConfiguringDomain] = useState<{
    id: string;
    domain: string;
    verified: boolean;
  } | null>(null);

  const domainForm = useForm<AddCustomDomainInput>({
    resolver: zodResolver(addCustomDomainSchema),
    defaultValues: { domain: '' },
  });

  const portfolioUrl = user?.username
    ? `${user.username}.betaversion.io`
    : '';

  const copyPortfolioUrl = useCallback(() => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [portfolioUrl]);

  function openAddDialog() {
    setConfiguringDomain(null);
    domainForm.reset();
    setDomainDialogOpen(true);
  }

  function openConfigDialog(d: {
    id: string;
    domain: string;
    verified: boolean;
  }) {
    setConfiguringDomain(d);
    setDomainDialogOpen(true);
  }

  function handleRemoveTemplate() {
    selectTemplateMutation.mutate(null, {
      onSuccess: () => {
        toast({
          title: 'Template removed',
          description: 'Your portfolio template has been removed.',
        });
      },
      onError: (err) => {
        toast({
          title: 'Failed to remove template',
          description:
            err instanceof Error ? err.message : 'Something went wrong.',
          variant: 'destructive',
        });
      },
    });
  }

  function onAddDomain(data: AddCustomDomainInput) {
    addDomainMutation.mutate(data.domain, {
      onSuccess: (created) => {
        domainForm.reset();
        setConfiguringDomain({
          id: created.id,
          domain: created.domain,
          verified: false,
        });
      },
      onError: (err) => {
        toast({
          title: 'Failed to add domain',
          description:
            err instanceof Error ? err.message : 'Something went wrong.',
          variant: 'destructive',
        });
      },
    });
  }

  function onVerifyDomain(domainId: string) {
    verifyDomainMutation.mutate(domainId, {
      onSuccess: (result) => {
        if (result.verified) {
          toast({
            title: 'Domain verified',
            description: `${result.domain} is now active.`,
          });
          setConfiguringDomain((prev) =>
            prev ? { ...prev, verified: true } : null,
          );
        } else {
          toast({
            title: 'Verification failed',
            description: `DNS records not yet pointing to ${portfolioUrl}. Changes can take up to 48 hours to propagate.`,
            variant: 'destructive',
          });
        }
      },
      onError: () => {
        toast({
          title: 'Verification error',
          description: 'Something went wrong.',
          variant: 'destructive',
        });
      },
    });
  }

  function onRemoveDomain(domainId: string) {
    removeDomainMutation.mutate(domainId, {
      onSuccess: () => {
        toast({ title: 'Domain removed' });
        if (configuringDomain?.id === domainId) {
          setDomainDialogOpen(false);
          setConfiguringDomain(null);
        }
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Template */}
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
                <p className="line-clamp-1 text-sm text-muted-foreground">
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
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                asChild
              >
                <Link href="/templates">Browse Templates</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio URL */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio URL</CardTitle>
          <CardDescription>
            Your personal portfolio is available at this address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm">
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

      {/* Custom Domains */}
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
                    className="flex min-w-0 items-center gap-3 text-left"
                    onClick={() => openConfigDialog(d)}
                  >
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
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
                  <div className="flex shrink-0 items-center gap-1.5">
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
              <Globe className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No custom domains configured
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={openAddDialog}
              >
                Add your first domain
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Configure Domain Dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {configuringDomain ? (
            <>
              <DialogHeader>
                <DialogTitle>Configure Domain</DialogTitle>
                <DialogDescription>
                  Set the following DNS record for{' '}
                  <span className="font-medium text-foreground">
                    {configuringDomain.domain}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          CNAME
                        </code>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {configuringDomain.domain}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {portfolioUrl}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 rounded-lg border px-4 py-3">
                {configuringDomain.verified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-500">
                        Valid Configuration
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your domain is correctly pointing to BetaVersion.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">
                        Awaiting DNS Configuration
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add the CNAME record above in your domain
                        provider&apos;s DNS settings. Changes can take up to 48
                        hours to propagate.
                      </p>
                    </div>
                  </>
                )}
              </div>

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
                    <RefreshCw
                      className={`mr-1.5 h-3.5 w-3.5 ${verifyDomainMutation.isPending ? 'animate-spin' : ''}`}
                    />
                    {verifyDomainMutation.isPending
                      ? 'Checking...'
                      : 'Verify DNS'}
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
                    {...domainForm.register('domain')}
                  />
                  {domainForm.formState.errors.domain?.message && (
                    <FieldError>
                      {domainForm.formState.errors.domain.message}
                    </FieldError>
                  )}
                </Field>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={addDomainMutation.isPending}
                  >
                    {addDomainMutation.isPending ? 'Adding...' : 'Add Domain'}
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
