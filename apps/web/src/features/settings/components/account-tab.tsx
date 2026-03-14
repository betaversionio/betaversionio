'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  changeUsernameSchema,
  setPasswordSchema,
} from '@betaversionio/shared';
import type {
  ChangePasswordInput,
  ChangeUsernameInput,
  SetPasswordInput,
} from '@betaversionio/shared';
import {
  useChangePassword,
  useSetPassword,
  useChangeUsername,
  useCheckUsername,
} from '@/features/auth';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';

export function AccountTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const changePasswordMutation = useChangePassword();
  const setPasswordMutation = useSetPassword();
  const changeUsernameMutation = useChangeUsername();
  const hasPassword = user?.hasPassword ?? true;

  // ─── Change Password Form ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  // ─── Set Password Form ─────────────────────────────────────────────────────
  const setPasswordForm = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '' },
  });

  // ─── Change Username Form ──────────────────────────────────────────────────
  const usernameForm = useForm<ChangeUsernameInput>({
    resolver: zodResolver(changeUsernameSchema),
    defaultValues: { username: user?.username ?? '' },
  });

  const watchedUsername = useWatch({
    control: usernameForm.control,
    name: 'username',
  });
  const debouncedUsername = useDebounce(watchedUsername || '', 500);
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
          title: 'Username changed',
          description: 'Your username has been updated successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to change username',
          description:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  function onSetPassword(data: SetPasswordInput) {
    setPasswordMutation.mutate(data.password, {
      onSuccess: () => {
        toast({
          title: 'Password set',
          description: 'You can now log in with your email and password.',
        });
        setPasswordForm.reset();
      },
      onError: (error) => {
        toast({
          title: 'Failed to set password',
          description:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  function onChangePassword(data: ChangePasswordInput) {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: 'Password changed',
          description: 'Your password has been updated successfully.',
        });
        reset();
      },
      onError: (error) => {
        toast({
          title: 'Failed to change password',
          description:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Change Username */}
      <Card>
        <CardHeader>
          <CardTitle>Change Username</CardTitle>
          <CardDescription>Update your unique username</CardDescription>
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
                {...usernameForm.register('username')}
              />
              {usernameForm.formState.errors.username?.message ? (
                <FieldError>
                  {usernameForm.formState.errors.username.message}
                </FieldError>
              ) : showUsernameCheck ? (
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  {usernameQuery.isLoading ? (
                    <span className="text-muted-foreground">Checking...</span>
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
                      <span className="text-destructive">Username taken</span>
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
                ? 'Changing...'
                : 'Change Username'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Email */}
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
              disabled
            />
          </div>
          <Button disabled>Update Email</Button>
          <p className="text-xs text-muted-foreground">
            Email change functionality coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Password */}
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
                  {...register('currentPassword')}
                />
                <FieldError>{errors.currentPassword?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <PasswordInput
                  id="newPassword"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <FieldError>{errors.newPassword?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? 'Changing...'
                  : 'Change Password'}
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
                  {...setPasswordForm.register('password')}
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
                  ? 'Setting...'
                  : 'Set Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Danger Zone */}
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
            Account deletion is not yet available. Contact support if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
