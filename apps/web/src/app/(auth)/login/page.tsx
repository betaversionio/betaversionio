"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@devcom/shared";
import type { LoginInput } from "@devcom/shared";
import { useAuth } from "@/providers/auth-provider";
import { useLogin } from "@/features/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { LogoWithText } from "@/components/shared/logo-with-text";
import { siteConfig } from "@/config/site";
import { GoogleIcon, GithubIcon } from "@/features/auth";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub, loginWithGoogle } = useAuth();
  const loginMutation = useLogin();
  const { toast } = useToast();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => router.push(callbackUrl),
        onError: (error) => {
          toast({
            title: "Login failed",
            description:
              error instanceof Error
                ? error.message
                : "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        },
      },
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
          onClick={loginWithGoogle}
          type="button"
        >
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={loginWithGithub}
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
            {...register("email")}
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
            {...register("password")}
          />
          <FieldError>{errors.password?.message}</FieldError>
        </Field>

        <Button
          type="submit"
          className="w-full"
          isLoading={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>

      <p className="text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="#"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="#"
        >
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
