import { z } from "zod";
import { USERNAME_REGEX } from "../constants/regex";
import { USERNAME } from "../constants/limits";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  username: z
    .string()
    .regex(
      USERNAME_REGEX,
      "Username must contain only alphanumeric characters, hyphens, and underscores"
    )
    .min(USERNAME.MIN, `Username must be at least ${USERNAME.MIN} characters`)
    .max(USERNAME.MAX, `Username must be at most ${USERNAME.MAX} characters`),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const checkUsernameSchema = z.object({
  username: z
    .string()
    .regex(USERNAME_REGEX, "Invalid username format")
    .min(USERNAME.MIN)
    .max(USERNAME.MAX),
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const changeUsernameSchema = z.object({
  username: z
    .string()
    .regex(
      USERNAME_REGEX,
      "Username must contain only alphanumeric characters, hyphens, and underscores"
    )
    .min(USERNAME.MIN, `Username must be at least ${USERNAME.MIN} characters`)
    .max(USERNAME.MAX, `Username must be at most ${USERNAME.MAX} characters`),
});
