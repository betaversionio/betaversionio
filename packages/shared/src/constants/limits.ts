export const USERNAME = {
  MIN: 3,
  MAX: 30,
} as const;

export const BIO = {
  MAX: 500,
} as const;

export const PROJECT_TITLE = {
  MAX: 100,
} as const;

export const PROJECT_DESCRIPTION = {
  MAX: 5000,
} as const;

export const POST_CONTENT = {
  MAX: 10000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FEED = {
  DEFAULT_CURSOR_LIMIT: 20,
  MAX_CURSOR_LIMIT: 50,
} as const;

export const FILE = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as const,
  ALLOWED_DOC_TYPES: ["application/pdf"] as const,
} as const;

export const PROJECT_TAGLINE = {
  MAX: 300,
} as const;

export const PROJECT_COMMENT = {
  MAX: 2000,
} as const;

export const RESUME_TITLE = {
  MAX: 100,
} as const;

export const LIMITS = {
  USERNAME,
  BIO,
  PROJECT_TITLE,
  PROJECT_DESCRIPTION,
  PROJECT_TAGLINE,
  PROJECT_COMMENT,
  POST_CONTENT,
  PAGINATION,
  FEED,
  FILE,
  RESUME_TITLE,
} as const;
