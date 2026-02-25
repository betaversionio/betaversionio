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
  educationItemSchema,
  updateEducationSchema,
  experienceItemSchema,
  updateExperienceSchema,
  serviceItemSchema,
  updateServicesSchema,
} from "../schemas/user";

import {
  createProjectSchema,
  updateProjectSchema,
  addMakerSchema,
  createProjectCommentSchema,
  updateProjectCommentSchema,
  toggleProjectVoteSchema,
  createProjectReviewSchema,
  updateProjectReviewSchema,
  createProjectUpdateSchema,
  updateProjectUpdateSchema,
  createInvitationSchema,
  respondInvitationSchema,
} from "../schemas/project";

import { createResumeSchema, updateResumeSchema } from "../schemas/resume";

import {
  createPostSchema,
  createCommentSchema,
  toggleReactionSchema,
} from "../schemas/feed";

import {
  createCollectionSchema,
  updateCollectionSchema,
  addCollectionItemSchema,
} from "../schemas/collection";

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
export type EducationItemInput = z.infer<typeof educationItemSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
export type ExperienceItemInput = z.infer<typeof experienceItemSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type ServiceItemInput = z.infer<typeof serviceItemSchema>;
export type UpdateServicesInput = z.infer<typeof updateServicesSchema>;

// ─── Project Types ───────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMakerInput = z.infer<typeof addMakerSchema>;
export type CreateProjectCommentInput = z.infer<typeof createProjectCommentSchema>;
export type UpdateProjectCommentInput = z.infer<typeof updateProjectCommentSchema>;
export type ToggleProjectVoteInput = z.infer<typeof toggleProjectVoteSchema>;
export type CreateProjectReviewInput = z.infer<typeof createProjectReviewSchema>;
export type UpdateProjectReviewInput = z.infer<typeof updateProjectReviewSchema>;
export type CreateProjectUpdateInput = z.infer<typeof createProjectUpdateSchema>;
export type UpdateProjectUpdateInput = z.infer<typeof updateProjectUpdateSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;

// ─── Resume Types ────────────────────────────────────────────────────────────

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;

// ─── Feed Types ──────────────────────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

// ─── Collection Types ────────────────────────────────────────────────────────

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddCollectionItemInput = z.infer<typeof addCollectionItemSchema>;
