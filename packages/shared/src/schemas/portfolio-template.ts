import { z } from 'zod';

const optionalUrl = z
  .union([z.url(), z.literal('')])
  .optional()
  .transform((v) => v || undefined);

export const portfolioTemplateStatusSchema = z.enum(['Draft', 'Published']);

export const createPortfolioTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(10000).optional(),
  previewImage: optionalUrl,
  previewUrl: optionalUrl,
  baseUrl: z.url(),
  repoUrl: optionalUrl,
  tags: z.array(z.string().max(50)).max(10).default([]),
  status: portfolioTemplateStatusSchema.optional(),
});

export const updatePortfolioTemplateSchema =
  createPortfolioTemplateSchema.partial();

export const selectPortfolioTemplateSchema = z.object({
  portfolioTemplateId: z.string().nullable(),
});
