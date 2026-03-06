'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { useVerifyEmail, useResendVerification } from '@/features/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoWithText } from '@/components/shared/logo-with-text';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const [token] = useQueryState('token', parseAsString);
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const { toast } = useToast();
  const [resendEmail, setResendEmail] = useState('');
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verifyMutation.mutate(token, {
        onError: (error) => {
          toast({
            title: 'Verification failed',
            description:
              error instanceof Error
                ? error.message
                : 'Invalid or expired verification link.',
            variant: 'destructive',
          });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-redirect after successful verification
  useEffect(() => {
    if (verifyMutation.isSuccess) {
      const timer = setTimeout(() => router.push('/feed'), 2000);
      return () => clearTimeout(timer);
    }
  }, [verifyMutation.isSuccess, router]);

  // ── Verifying with token ──
  if (token) {
    if (verifyMutation.isPending) {
      return (
        <div className="space-y-4 text-center">
          <LogoWithText />
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      );
    }

    if (verifyMutation.isSuccess) {
      return (
        <div className="space-y-4 text-center">
          <LogoWithText />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Email verified!</h1>
          <p className="text-muted-foreground">
            Your account is now active. Redirecting you to the feed...
          </p>
        </div>
      );
    }

    if (verifyMutation.isError) {
      return (
        <div className="space-y-4 text-center">
          <LogoWithText />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            Invalid or expired link
          </h1>
          <p className="text-muted-foreground">
            This verification link is no longer valid. Enter your email below to
            get a new one.
          </p>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={!resendEmail || resendMutation.isPending}
              onClick={() =>
                resendMutation.mutate(resendEmail, {
                  onSuccess: () =>
                    toast({
                      title: 'Email sent',
                      description:
                        'If an account exists, a verification email has been sent.',
                    }),
                  onError: (error) =>
                    toast({
                      title: 'Failed to send email',
                      description:
                        error instanceof Error
                          ? error.message
                          : 'Something went wrong. Please try again.',
                      variant: 'destructive',
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
          </div>
        </div>
      );
    }
  }

  // ── No token — check your email UI ──
  return (
    <div className="space-y-4 text-center">
      <LogoWithText />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-wide">Check your email</h1>
      <p className="text-muted-foreground">
        Enter the email you registered with to receive a new verification link.
      </p>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
        />
        <Button
          className="w-full"
          disabled={!resendEmail || resendMutation.isPending}
          onClick={() =>
            resendMutation.mutate(resendEmail, {
              onSuccess: () =>
                toast({
                  title: 'Email sent',
                  description:
                    'If an account exists, a verification email has been sent.',
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
            'Send verification email'
          )}
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
