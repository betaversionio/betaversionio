"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@devcom/shared";
import type { RegisterInput } from "@devcom/shared";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogoWithText } from "@/components/shared/logo-with-text";
import { siteConfig } from "@/config/site";
import { GoogleIcon, GithubIcon } from "@/features/auth";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loginWithGithub, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.password, data.username, data.name);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
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
