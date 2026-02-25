import { z } from "zod";
import { SocialPlatformSchema, TechCategorySchema, ProficiencySchema, EmploymentTypeSchema } from "../constants/enums";
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

// ─── Education ──────────────────────────────────────────────────────────────

export const educationItemSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(200),
  degree: z.string().min(1, "Degree is required").max(200),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000).optional(),
});

export const updateEducationSchema = z.object({
  items: z.array(educationItemSchema),
});

// ─── Experience ─────────────────────────────────────────────────────────────

export const experienceItemSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  position: z.string().min(1, "Position is required").max(200),
  location: z.string().max(200).optional(),
  employmentType: EmploymentTypeSchema,
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().max(2000).optional(),
});

export const updateExperienceSchema = z.object({
  items: z.array(experienceItemSchema),
});

// ─── Services ───────────────────────────────────────────────────────────────

export const serviceItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

export const updateServicesSchema = z.object({
  items: z.array(serviceItemSchema),
});
