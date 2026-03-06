'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const resetFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormInput = z.infer<typeof resetFormSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const [token] = useQueryState('token', parseAsString);
  const resetMutation = useResetPassword();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInput>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function onSubmit(data: ResetFormInput) {
    if (!token) return;
    resetMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast({
            title: 'Password reset',
            description: 'Your password has been reset. Redirecting to login...',
          });
          setTimeout(() => router.push('/login'), 2000);
        },
        onError: (error) => {
          toast({
            title: 'Reset failed',
            description:
              error instanceof Error
                ? error.message
                : 'Invalid or expired link. Please request a new one.',
            variant: 'destructive',
          });
        },
      },
    );
  }

  // No token
  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <LogoWithText />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Invalid link</h1>
        <p className="text-muted-foreground">
          This password reset link is invalid. Please request a new one.
        </p>
        <Button asChild className="w-full" variant="outline">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  // Success
  if (resetMutation.isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <LogoWithText />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Password reset!</h1>
        <p className="text-muted-foreground">
          Your password has been changed. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LogoWithText />
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-wide">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter a new password for your account.
        </p>
      </div>

      {resetMutation.isError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {resetMutation.error instanceof Error
            ? resetMutation.error.message
            : 'Invalid or expired link. Please request a new one.'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          <FieldError>{errors.confirmPassword?.message}</FieldError>
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={resetMutation.isPending}
        >
          {resetMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
