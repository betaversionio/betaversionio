import { z } from "zod";
import {
  ProjectStatusSchema,
  CollaboratorRoleSchema,
  MediaTypeSchema,
} from "../constants/enums";
import { SLUG_REGEX } from "../constants/regex";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "../constants/limits";

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
    .regex(SLUG_REGEX, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .min(1, "Slug is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(
      PROJECT_DESCRIPTION.MAX,
      `Description must be at most ${PROJECT_DESCRIPTION.MAX} characters`
    ),
  shortDescription: z
    .string()
    .max(200, "Short description must be at most 200 characters")
    .optional(),
  techStack: z.array(z.string().min(1)).default([]),
  repoUrl: z.string().url("Invalid repository URL").optional(),
  liveUrl: z.string().url("Invalid live URL").optional(),
  status: ProjectStatusSchema,
});

export const updateProjectSchema = createProjectSchema.partial();

export const addCollaboratorSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: CollaboratorRoleSchema,
});

export const addMediaSchema = z.object({
  type: MediaTypeSchema,
  url: z.string().url("Invalid media URL"),
  caption: z
    .string()
    .max(300, "Caption must be at most 300 characters")
    .optional(),
});
