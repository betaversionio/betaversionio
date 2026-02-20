import { z } from "zod";
import { SocialPlatformSchema, TechCategorySchema, ProficiencySchema } from "../constants/enums";
import { BIO } from "../constants/limits";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  bio: z
    .string()
    .max(BIO.MAX, `Bio must be at most ${BIO.MAX} characters`)
    .optional(),
  headline: z
    .string()
    .max(150, "Headline must be at most 150 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  website: z.string().url("Invalid website URL").optional(),
});

export const socialLinkSchema = z.object({
  platform: SocialPlatformSchema,
  url: z.string().url("Invalid URL"),
});

export const updateSocialLinksSchema = z.object({
  links: z.array(socialLinkSchema),
});

export const techStackItemSchema = z.object({
  name: z.string().min(1, "Technology name is required").max(50),
  category: TechCategorySchema,
  proficiency: ProficiencySchema,
});

export const updateTechStackSchema = z.object({
  items: z.array(techStackItemSchema),
});
