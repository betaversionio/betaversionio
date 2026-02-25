import { z } from "zod";
import { SLUG_REGEX } from "../constants/regex";

export const createCollectionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  slug: z
    .string()
    .regex(
      SLUG_REGEX,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .min(1, "Slug is required"),
  description: z.string().max(5000).optional(),
  isPublic: z.boolean().default(true),
  coverImage: z.string().url("Invalid cover image URL").optional(),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const addCollectionItemSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  note: z.string().max(500).optional(),
});
