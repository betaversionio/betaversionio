import { z } from "zod";
import {
  IdeaStageSchema,
  CommitmentSchema,
  CompensationSchema,
} from "../constants/enums";
import { IDEA_DESCRIPTION } from "../constants/limits";

const ideaRoleSchema = z.object({
  title: z
    .string()
    .min(1, "Role title is required")
    .max(100, "Role title must be at most 100 characters"),
  description: z
    .string()
    .min(1, "Role description is required")
    .max(1000, "Role description must be at most 1000 characters"),
  commitment: CommitmentSchema,
  compensation: CompensationSchema,
});

export const createIdeaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(
      IDEA_DESCRIPTION.MAX,
      `Description must be at most ${IDEA_DESCRIPTION.MAX} characters`
    ),
  stage: IdeaStageSchema,
  techStack: z.array(z.string().min(1)).default([]),
  roles: z.array(ideaRoleSchema).default([]),
});

export const updateIdeaSchema = createIdeaSchema.partial();

export const createApplicationSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional(),
});
