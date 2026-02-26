import { z } from "zod";
import { RESUME_TITLE } from "../constants/limits";

const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(200),
  degree: z.string().min(1, "Degree is required").max(200),
  fieldOfStudy: z.string().max(200).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional(),
});

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  position: z.string().min(1, "Position is required").max(200),
  location: z.string().max(200).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(2000).optional(),
  highlights: z.array(z.string().max(500)).default([]),
});

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  level: z.string().max(50).optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(200),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().max(200).optional(),
  credentialUrl: z.string().url("Invalid credential URL").optional(),
});

const customSectionSchema = z.object({
  title: z.string().min(1, "Section title is required").max(100),
  content: z.string().max(5000).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        subtitle: z.string().max(200).optional(),
        date: z.string().optional(),
        description: z.string().max(2000).optional(),
      })
    )
    .default([]),
});

const sectionsSchema = z.object({
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  skills: z.array(skillSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
});

export const createResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(
      RESUME_TITLE.MAX,
      `Title must be at most ${RESUME_TITLE.MAX} characters`
    ),
  templateId: z.string().uuid("Invalid template ID").optional(),
  sections: sectionsSchema,
  latexSource: z.string().max(100_000).optional(),
});

export const updateResumeSchema = createResumeSchema.partial().extend({
  githubRepo: z.string().max(200).optional(),
  githubPath: z.string().max(500).optional(),
  githubSha: z.string().max(100).optional(),
});

export const compileLatexSchema = z.object({
  latexSource: z
    .string()
    .min(1, "LaTeX source is required")
    .max(100_000, "LaTeX source is too long"),
});
