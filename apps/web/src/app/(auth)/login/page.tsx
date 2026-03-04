'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@betaversionio/shared';
import type { LoginInput } from '@betaversionio/shared';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/providers/auth-provider';
import { useLogin, useResendVerification } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { siteConfig } from '@/config/site';
import { GoogleIcon, GithubIcon } from '@/features/auth';
import { Loader2, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub, loginWithGoogle } = useAuth();
  const loginMutation = useLogin();
  const resendMutation = useResendVerification();
  const { toast } = useToast();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/feed';

  async function handleGithubLogin() {
    try {
      await loginWithGithub();
      router.push(callbackUrl);
    } catch {
      toast({
        title: 'Login failed',
        description: 'GitHub authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push(callbackUrl);
      } catch {
        toast({
          title: 'Login failed',
          description: 'Google authentication failed. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Login failed',
        description: 'Google authentication failed. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginInput) {
    setUnverifiedEmail(null);
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => router.push(callbackUrl),
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : '';

          if (message.toLowerCase().includes('verify your email')) {
            setUnverifiedEmail(data.email);
            return;
          }

          toast({
            title: 'Login failed',
            description: message || 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  }

  // ── Unverified email state ──
  if (unverifiedEmail) {
    return (
      <div className="space-y-4 text-center">
        <LogoWithText />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">
          Email not verified
        </h1>
        <p className="text-muted-foreground">
          Your email <strong>{unverifiedEmail}</strong> hasn&apos;t been
          verified yet. Check your inbox or request a new verification link.
        </p>
        <Button
          className="w-full"
          disabled={resendMutation.isPending}
          onClick={() =>
            resendMutation.mutate(unverifiedEmail, {
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
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setUnverifiedEmail(null)}
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LogoWithText />
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-wide">Welcome back</h1>
        <p className="text-base text-muted-foreground">
          Sign in to your {siteConfig.name} account
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
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Button
          type="submit"
          className="w-full"
          isLoading={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="flex justify-between text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
        <Link
          href="/verify-email"
          className="hover:text-foreground"
        >
          Resend verification
        </Link>
      </div>

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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
