import { z } from "zod";

export const portfolioTemplateStatusSchema = z.enum(["Draft", "Published"]);

export const createPortfolioTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  previewImage: z.string().url(),
  previewUrl: z.string().url().optional(),
  baseUrl: z.string().url(),
  repoUrl: z.string().url().optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  status: portfolioTemplateStatusSchema.optional(),
});

export const updatePortfolioTemplateSchema = createPortfolioTemplateSchema.partial();

export const selectPortfolioTemplateSchema = z.object({
  portfolioTemplateId: z.string().nullable(),
});
