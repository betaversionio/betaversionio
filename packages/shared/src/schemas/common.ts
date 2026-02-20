import { z } from "zod";
import { PAGINATION, FEED } from "../constants/limits";

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(FEED.MAX_CURSOR_LIMIT)
    .default(FEED.DEFAULT_CURSOR_LIMIT),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1),
});
