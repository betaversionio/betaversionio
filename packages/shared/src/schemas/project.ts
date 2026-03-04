import { z } from "zod";
import {
  ProjectStatusSchema,
  ProjectPhaseSchema,
  ProductionTypeSchema,
} from "../constants/enums";
import { SLUG_REGEX } from "../constants/regex";
import {
  PROJECT_TITLE,
  PROJECT_DESCRIPTION,
  PROJECT_TAGLINE,
  PROJECT_COMMENT,
} from "../constants/limits";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(
      PROJECT_TITLE.MAX,
      `Title must be at most ${PROJECT_TITLE.MAX} characters`
    ),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .min(1, "Slug is required"),
  tagline: z
    .string()
    .max(
      PROJECT_TAGLINE.MAX,
      `Tagline must be at most ${PROJECT_TAGLINE.MAX} characters`
    )
    .optional(),
  description: z
    .string()
    .max(
      PROJECT_DESCRIPTION.MAX,
      `Description must be at most ${PROJECT_DESCRIPTION.MAX} characters`
    )
    .optional()
    .default(""),
  logo: z.string().url("Invalid logo URL").optional(),
  links: z.array(z.string().url("Invalid URL")).default([]),
  isOpenSource: z.boolean().default(false),
  images: z.array(z.string().url("Invalid image URL")).default([]),
  techStack: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  status: ProjectStatusSchema,
  phase: ProjectPhaseSchema,
  productionType: ProductionTypeSchema,
  demoUrl: z.string().url("Invalid demo URL").optional(),
  videoUrl: z.string().url("Invalid video URL").optional(),
  launchDate: z.string().datetime({ offset: true }).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createProjectCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(
      PROJECT_COMMENT.MAX,
      `Comment must be at most ${PROJECT_COMMENT.MAX} characters`
    ),
  parentId: z.string().min(1, "Invalid parent comment ID").optional(),
});

export const updateProjectCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(
      PROJECT_COMMENT.MAX,
      `Comment must be at most ${PROJECT_COMMENT.MAX} characters`
    ),
});

export const toggleProjectVoteSchema = z.object({
  value: z
    .number()
    .int()
    .refine((v) => v === 1 || v === -1, "Value must be 1 or -1"),
});

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const createProjectReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be at most 5000 characters"),
});

export const updateProjectReviewSchema = createProjectReviewSchema.partial();

// ─── Updates / Changelog ──────────────────────────────────────────────────────

export const createProjectUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10000, "Content must be at most 10000 characters"),
  version: z.string().max(50).optional(),
});

export const updateProjectUpdateSchema = createProjectUpdateSchema.partial();

export const updateMakerRoleSchema = z.object({
  role: z.string().min(1, "Role is required").max(100),
});

// ─── Invitations ──────────────────────────────────────────────────────────────

export const createInvitationSchema = z.object({
  username: z.string().min(1, "Username is required"),
  role: z.string().min(1, "Role is required").max(100),
  message: z.string().max(500).optional(),
});

export const respondInvitationSchema = z.object({
  action: z.enum(["accept", "reject"]),
});
