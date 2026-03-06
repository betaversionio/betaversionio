import { z } from "zod";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  checkUsernameSchema,
  changeUsernameSchema,
  setPasswordSchema,
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
  addCustomDomainSchema,
} from "../schemas/user";

import {
  createProjectSchema,
  updateProjectSchema,
  updateMakerRoleSchema,
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

import {
  createResumeSchema,
  updateResumeSchema,
  compileLatexSchema,
} from "../schemas/resume";

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

import {
  createBlogSchema,
  updateBlogSchema,
  toggleBlogVoteSchema,
  createBlogCommentSchema,
  updateBlogCommentSchema,
} from "../schemas/blog";

import {
  connectGithubSchema,
  pushFileSchema,
} from "../schemas/github";

import {
  createPortfolioTemplateSchema,
  updatePortfolioTemplateSchema,
  selectPortfolioTemplateSchema,
} from "../schemas/portfolio-template";

// ─── Auth Types ──────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CheckUsernameInput = z.infer<typeof checkUsernameSchema>;
export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;

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
export type AddCustomDomainInput = z.infer<typeof addCustomDomainSchema>;

// ─── Project Types ───────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateMakerRoleInput = z.infer<typeof updateMakerRoleSchema>;
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
export type CompileLatexInput = z.infer<typeof compileLatexSchema>;

// ─── Feed Types ──────────────────────────────────────────────────────────────

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

// ─── Collection Types ────────────────────────────────────────────────────────

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AddCollectionItemInput = z.infer<typeof addCollectionItemSchema>;

// ─── Blog Types ─────────────────────────────────────────────────────────────

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type ToggleBlogVoteInput = z.infer<typeof toggleBlogVoteSchema>;
export type CreateBlogCommentInput = z.infer<typeof createBlogCommentSchema>;
export type UpdateBlogCommentInput = z.infer<typeof updateBlogCommentSchema>;

// ─── GitHub Types ───────────────────────────────────────────────────────────

export type ConnectGithubInput = z.infer<typeof connectGithubSchema>;
export type PushFileInput = z.infer<typeof pushFileSchema>;

// ─── Portfolio Template Types ───────────────────────────────────────────────

export type CreatePortfolioTemplateInput = z.infer<typeof createPortfolioTemplateSchema>;
export type UpdatePortfolioTemplateInput = z.infer<typeof updatePortfolioTemplateSchema>;
export type SelectPortfolioTemplateInput = z.infer<typeof selectPortfolioTemplateSchema>;
