import { z } from "zod";
import { PostTypeSchema, ReactionTypeSchema } from "../constants/enums";
import { POST_CONTENT } from "../constants/limits";

export const createPostSchema = z.object({
  type: PostTypeSchema,
  content: z
    .string()
    .min(1, "Content is required")
    .max(
      POST_CONTENT.MAX,
      `Content must be at most ${POST_CONTENT.MAX} characters`
    ),
  title: z
    .string()
    .max(200, "Title must be at most 200 characters")
    .optional(),
  codeSnippet: z
    .object({
      code: z.string().min(1, "Code is required").max(5000),
      language: z.string().min(1, "Language is required").max(50),
    })
    .optional(),
  hashtags: z
    .array(z.string().min(1).max(50))
    .max(10, "Maximum 10 hashtags allowed")
    .optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content is required")
    .max(2000, "Comment must be at most 2000 characters"),
  parentId: z.string().uuid("Invalid parent comment ID").optional(),
});

export const toggleReactionSchema = z.object({
  type: ReactionTypeSchema,
});
