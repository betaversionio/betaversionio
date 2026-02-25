import { z } from "zod";
import { BlogStatusSchema } from "../constants/enums";
import { SLUG_REGEX } from "../constants/regex";
import {
  BLOG_TITLE,
  BLOG_CONTENT,
  BLOG_EXCERPT,
  PROJECT_COMMENT,
} from "../constants/limits";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(BLOG_TITLE.MAX, `Title must be at most ${BLOG_TITLE.MAX} characters`),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .min(1, "Slug is required"),
  excerpt: z
    .string()
    .max(
      BLOG_EXCERPT.MAX,
      `Excerpt must be at most ${BLOG_EXCERPT.MAX} characters`
    )
    .optional(),
  content: z
    .string()
    .max(
      BLOG_CONTENT.MAX,
      `Content must be at most ${BLOG_CONTENT.MAX} characters`
    )
    .optional()
    .default(""),
  coverImage: z.string().url("Invalid cover image URL").optional(),
  tags: z.array(z.string().min(1)).default([]),
  status: BlogStatusSchema,
});

export const updateBlogSchema = createBlogSchema.partial();

export const toggleBlogVoteSchema = z.object({
  value: z
    .number()
    .int()
    .refine((v) => v === 1 || v === -1, "Value must be 1 or -1"),
});

export const createBlogCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(
      PROJECT_COMMENT.MAX,
      `Comment must be at most ${PROJECT_COMMENT.MAX} characters`
    ),
  parentId: z.string().min(1, "Invalid parent comment ID").optional(),
});

export const updateBlogCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(
      PROJECT_COMMENT.MAX,
      `Comment must be at most ${PROJECT_COMMENT.MAX} characters`
    ),
});
