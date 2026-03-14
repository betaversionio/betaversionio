'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@betaversionio/shared';
import type { RegisterInput } from '@betaversionio/shared';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/providers/auth-provider';
import { useCheckUsername, useResendVerification } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { siteConfig } from '@/config/site';
import { GoogleIcon, GithubIcon } from '@/features/auth';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useRegister } from '@/features/auth';
import { useDebounce } from '@/hooks/use-debounce';

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithGithub, loginWithGoogle } = useAuth();
  const registerMutation = useRegister();
  const resendMutation = useResendVerification();
  const { toast } = useToast();
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  async function handleGithubLogin() {
    try {
      await loginWithGithub();
      router.push('/feed');
    } catch {
      toast({
        title: 'Registration failed',
        description: 'GitHub authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push('/feed');
      } catch {
        toast({
          title: 'Registration failed',
          description: 'Google authentication failed. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Registration failed',
        description: 'Google authentication failed. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const usernameValue = useWatch({ control, name: 'username' });
  const debouncedUsername = useDebounce(usernameValue || '', 500);
  const usernameQuery = useCheckUsername(debouncedUsername);

  async function onSubmit(data: RegisterInput) {
    registerMutation.mutate(data, {
      onSuccess: () => {
        setRegisteredEmail(data.email);
      },
      onError: (error) => {
        toast({
          title: 'Registration failed',
          description:
            error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  }

  // ── Verification email sent state ──
  if (registeredEmail) {
    return (
      <div className="space-y-4 text-center">
        <LogoWithText />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">Check your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to{' '}
          <strong>{registeredEmail}</strong>. Click the link to activate your
          account.
        </p>
        <Button
          variant="outline"
          className="w-full"
          disabled={resendMutation.isPending}
          onClick={() =>
            resendMutation.mutate(registeredEmail, {
              onSuccess: () =>
                toast({
                  title: 'Email sent',
                  description: 'A new verification email has been sent.',
                }),
            })
          }
        >
          {resendMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Resend verification email'
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Already verified?{' '}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // ── Username availability indicator ──
  const showUsernameCheck =
    debouncedUsername.length >= 3 &&
    !errors.username &&
    debouncedUsername === usernameValue;

  return (
    <div className="space-y-4">
      <LogoWithText />
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-wide">
          Create your account
        </h1>
        <p className="text-base text-muted-foreground">
          Join {siteConfig.name} and showcase your developer identity
        </p>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => googleLogin()}
          type="button"
        >
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={handleGithubLogin}
          type="button"
        >
          <GithubIcon />
          Continue with GitHub
        </Button>
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            {...register('name')}
          />
          <FieldError>{errors.name?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            {...register('username')}
          />
          {errors.username?.message ? (
            <FieldError>{errors.username.message}</FieldError>
          ) : showUsernameCheck ? (
            <div className="flex items-center gap-1.5 text-xs mt-1">
              {usernameQuery.isLoading ? (
                <span className="text-muted-foreground">Checking...</span>
              ) : usernameQuery.data?.available ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500">Username available</span>
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

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="text-sm text-muted-foreground">
        By clicking continue, you agree to our{' '}
        <a className="underline underline-offset-4 hover:text-primary" href="#">
          Terms of Service
        </a>{' '}
        and{' '}
        <a className="underline underline-offset-4 hover:text-primary" href="#">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
