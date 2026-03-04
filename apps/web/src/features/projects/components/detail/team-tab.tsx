'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createInvitationSchema, updateMakerRoleSchema } from '@betaversionio/shared';
import type { ProjectMaker } from '@/hooks/queries/use-project-queries';
import {
  useUpdateMakerRole,
  useRemoveMaker,
} from '@/hooks/queries/use-project-queries';
import {
  useCreateInvitation,
  useProjectInvitations,
  useCancelInvitation,
} from '@/hooks/queries/use-invitation-queries';
import { useSearchUsers } from '@/hooks/queries/use-user-queries';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { People, UserAdd, CloseCircle, TickCircle, Clock, Edit2, Trash } from 'iconsax-react';

const ROLE_SUGGESTIONS = [
  'Co-Founder',
  'Developer',
  'Designer',
  'Product Manager',
  'Marketing',
  'DevOps',
  'QA / Testing',
  'Content Writer',
];

type InviteFormValues = z.input<typeof createInvitationSchema>;

interface TeamTabProps {
  makers: ProjectMaker[];
  projectId: string;
  isOwner: boolean;
}

export function TeamTab({ makers, projectId, isOwner }: TeamTabProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [editingMaker, setEditingMaker] = useState<ProjectMaker | null>(null);
  const [removingMaker, setRemovingMaker] = useState<ProjectMaker | null>(null);

  return (
    <div className="mt-6 space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowInvite(true)}
          >
            <UserAdd size={16} color="currentColor" />
            Invite Member
          </Button>
        </div>
      )}

      {makers.length === 0 && !isOwner ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <People
              size={20}
              color="currentColor"
              variant="Linear"
              className="text-muted-foreground"
            />
          </div>
          <p className="mt-4 text-sm font-medium">No team members listed</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The project owner hasn&apos;t added any makers yet.
          </p>
        </div>
      ) : (
        <>
          {makers.length > 0 && (
            <div className="space-y-2">
              {makers.map((maker) => (
                <div
                  key={maker.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <Link
                    href={`/@${maker.user.username}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <UserAvatar
                      src={maker.user.avatarUrl}
                      name={maker.user.name}
                      className="h-9 w-9"
                      fallbackClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {maker.user.name ?? maker.user.username}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{maker.user.username}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {maker.role}
                    </Badge>
                    {isOwner && maker.role !== 'Creator' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingMaker(maker)}
                        >
                          <Edit2 size={14} color="currentColor" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setRemovingMaker(maker)}
                        >
                          <Trash size={14} color="currentColor" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOwner && <PendingInvitations projectId={projectId} />}
        </>
      )}

      {isOwner && (
        <>
          <InviteDialog
            projectId={projectId}
            open={showInvite}
            onOpenChange={setShowInvite}
          />
          <EditRoleDialog
            projectId={projectId}
            maker={editingMaker}
            onOpenChange={(open) => !open && setEditingMaker(null)}
          />
          <RemoveMakerDialog
            projectId={projectId}
            maker={removingMaker}
            onOpenChange={(open) => !open && setRemovingMaker(null)}
          />
        </>
      )}
    </div>
  );
}

function EditRoleDialog({
  projectId,
  maker,
  onOpenChange,
}: {
  projectId: string;
  maker: ProjectMaker | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const updateRole = useUpdateMakerRole(projectId);

  const form = useForm<{ role: string }>({
    resolver: zodResolver(updateMakerRoleSchema),
    values: { role: maker?.role ?? '' },
  });

  async function onSubmit(data: { role: string }) {
    if (!maker) return;
    try {
      await updateRole.mutateAsync({
        makerUserId: maker.userId,
        role: data.role,
      });
      toast({
        title: 'Role updated',
        description: `Updated ${maker.user.name ?? maker.user.username}'s role to ${data.role}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to update role',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={!!maker} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={maker?.user.avatarUrl ?? null}
              name={maker?.user.name ?? null}
              className="h-9 w-9"
              fallbackClassName="text-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {maker?.user.name ?? maker?.user.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{maker?.user.username}
              </p>
            </div>
          </div>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Input
              placeholder="e.g. Developer, Designer..."
              {...form.register('role')}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() =>
                    form.setValue('role', role, { shouldValidate: true })
                  }
                >
                  {role}
                </button>
              ))}
            </div>
            <FieldError errors={[form.formState.errors.role]} />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={updateRole.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveMakerDialog({
  projectId,
  maker,
  onOpenChange,
}: {
  projectId: string;
  maker: ProjectMaker | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const removeMaker = useRemoveMaker(projectId);

  async function handleRemove() {
    if (!maker) return;
    try {
      await removeMaker.mutateAsync(maker.userId);
      toast({
        title: 'Member removed',
        description: `${maker.user.name ?? maker.user.username} has been removed from the project.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to remove member',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  return (
    <AlertDialog open={!!maker} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove team member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{' '}
            <span className="font-medium text-foreground">
              {maker?.user.name ?? maker?.user.username}
            </span>{' '}
            from this project? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PendingInvitations({ projectId }: { projectId: string }) {
  const { data: invitations } = useProjectInvitations(projectId);
  const cancelInvitation = useCancelInvitation(projectId);

  const pending = invitations?.filter((inv) => inv.status === 'Pending') ?? [];

  if (pending.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Pending Invitations
      </p>
      {pending.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded-lg border border-dashed bg-card px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              src={inv.invitee?.avatarUrl ?? null}
              name={inv.invitee?.name ?? null}
              className="h-9 w-9"
              fallbackClassName="text-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {inv.invitee?.name ?? inv.invitee?.username ?? 'Unknown'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={11} color="currentColor" />
                Pending
                <span className="mx-0.5">·</span>
                {inv.role}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-destructive hover:text-destructive"
            isLoading={cancelInvitation.isPending}
            onClick={() => cancelInvitation.mutate(inv.id)}
          >
            <CloseCircle size={14} color="currentColor" />
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}

function InviteDialog({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const createInvitation = useCreateInvitation(projectId);

  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useSearchUsers(searchQuery);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: {
      username: '',
      role: '',
      message: '',
    },
  });

  const selectedUsername = form.watch('username');

  function handleOpenChange(open: boolean) {
    onOpenChange(open);
    if (!open) {
      form.reset();
      setSearchQuery('');
    }
  }

  function selectUser(username: string) {
    form.setValue('username', username, { shouldValidate: true });
    setSearchQuery('');
  }

  function clearUser() {
    form.setValue('username', '', { shouldValidate: true });
    setSearchQuery('');
  }

  async function onSubmit(data: InviteFormValues) {
    try {
      await createInvitation.mutateAsync({
        username: data.username,
        role: data.role,
        message: data.message?.trim() || undefined,
      });
      toast({
        title: 'Invitation sent',
        description: `Invited @${data.username} as ${data.role}.`,
      });
      form.reset();
      setSearchQuery('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to send invitation',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  const showDropdown =
    searchQuery.length >= 2 &&
    !selectedUsername &&
    searchResults?.items &&
    searchResults.items.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <FieldGroup>
              {/* User search */}
              <Field>
                <FieldLabel>Username</FieldLabel>
                <FieldDescription>
                  Search for a user to invite to your project.
                </FieldDescription>
                {selectedUsername ? (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                    <TickCircle
                      size={16}
                      color="currentColor"
                      className="text-primary"
                    />
                    <span className="text-sm font-medium">
                      @{selectedUsername}
                    </span>
                    <button
                      type="button"
                      onClick={clearUser}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      <CloseCircle size={16} color="currentColor" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="Search by username or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoComplete="off"
                    />
                    {showDropdown && (
                      <div className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                        {searchResults.items.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
                            onClick={() => selectUser(user.username)}
                          >
                            <UserAvatar
                              src={user.avatarUrl}
                              name={user.name}
                              className="h-7 w-7"
                              fallbackClassName="text-[9px]"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {user.name ?? user.username}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                @{user.username}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <FieldError errors={[form.formState.errors.username]} />
              </Field>

              {/* Role */}
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Input
                  placeholder="e.g. Developer, Designer, PM..."
                  {...form.register('role')}
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ROLE_SUGGESTIONS.map((role) => (
                    <button
                      key={role}
                      type="button"
                      className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() =>
                        form.setValue('role', role, { shouldValidate: true })
                      }
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <FieldError errors={[form.formState.errors.role]} />
              </Field>

              {/* Message */}
              <Field>
                <FieldLabel>
                  Message
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  placeholder="Add a personal note to your invitation..."
                  rows={3}
                  className="resize-none"
                  {...form.register('message')}
                />
                <FieldError errors={[form.formState.errors.message]} />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createInvitation.isPending}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
