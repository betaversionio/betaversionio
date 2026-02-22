import { z } from "zod";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../schemas/auth";

import {
  updateProfileSchema,
  socialLinkSchema,
  updateSocialLinksSchema,
  techStackItemSchema,
  updateTechStackSchema,
} from "../schemas/user";

import {
  createProjectSchema,
  updateProjectSchema,
  addMakerSchema,
  createProjectCommentSchema,
  toggleProjectVoteSchema,
} from "../schemas/project";

import { createResumeSchema, updateResumeSchema } from "../schemas/resume";

import {
  createPostSchema,
  createCommentSchema,
  toggleReactionSchema,
} from "../schemas/feed";

// ─── Auth Types ──────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// ─── User / Profile Types ────────────────────────────────────────────────────

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type UpdateSocialLinksInput = z.infer<typeof updateSocialLinksSchema>;
export type TechStackItemInput = z.infer<typeof techStackItemSchema>;
export type UpdateTechStackInput = z.infer<typeof updateTechStackSchema>;

// ─── Project Types ───────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMakerInput = z.infer<typeof addMakerSchema>;
export type CreateProjectCommentInput = z.infer<typeof createProjectCommentSchema>;
export type ToggleProjectVoteInput = z.infer<typeof toggleProjectVoteSchema>;

// ─── Resume Types ────────────────────────────────────────────────────────────

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;

// ─── Feed Types ──────────────────────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
