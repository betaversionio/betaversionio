import { z } from "zod";

export const connectGithubSchema = z.object({
  installationId: z.number().int().positive("Installation ID is required"),
});

export const pushFileSchema = z.object({
  path: z.string().min(1, "File path is required"),
  content: z.string().min(1, "Content is required"),
  message: z.string().min(1, "Commit message is required").max(200),
  sha: z.string().optional(),
});
