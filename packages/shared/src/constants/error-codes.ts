// ─── Auth Error Codes ────────────────────────────────────────────────────────

export const AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS" as const;
export const AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED" as const;
export const AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED" as const;

// ─── User Error Codes ────────────────────────────────────────────────────────

export const USER_NOT_FOUND = "USER_NOT_FOUND" as const;
export const USER_USERNAME_TAKEN = "USER_USERNAME_TAKEN" as const;
export const USER_EMAIL_TAKEN = "USER_EMAIL_TAKEN" as const;

// ─── Project Error Codes ─────────────────────────────────────────────────────

export const PROJECT_NOT_FOUND = "PROJECT_NOT_FOUND" as const;

// ─── Resume Error Codes ──────────────────────────────────────────────────────

export const RESUME_NOT_FOUND = "RESUME_NOT_FOUND" as const;

// ─── Post Error Codes ────────────────────────────────────────────────────────

export const POST_NOT_FOUND = "POST_NOT_FOUND" as const;

// ─── Idea Error Codes ────────────────────────────────────────────────────────

export const IDEA_NOT_FOUND = "IDEA_NOT_FOUND" as const;

// ─── Storage Error Codes ─────────────────────────────────────────────────────

export const STORAGE_UPLOAD_FAILED = "STORAGE_UPLOAD_FAILED" as const;

// ─── General Error Codes ─────────────────────────────────────────────────────

export const VALIDATION_ERROR = "VALIDATION_ERROR" as const;
export const INTERNAL_ERROR = "INTERNAL_ERROR" as const;

// ─── Error Codes Map ─────────────────────────────────────────────────────────

export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS,
  AUTH_TOKEN_EXPIRED,
  AUTH_UNAUTHORIZED,
  USER_NOT_FOUND,
  USER_USERNAME_TAKEN,
  USER_EMAIL_TAKEN,
  PROJECT_NOT_FOUND,
  RESUME_NOT_FOUND,
  POST_NOT_FOUND,
  IDEA_NOT_FOUND,
  STORAGE_UPLOAD_FAILED,
  VALIDATION_ERROR,
  INTERNAL_ERROR,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
