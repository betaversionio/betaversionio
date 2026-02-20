export const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/;

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const URL_REGEX = /^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w\-./?%&=~#]*)?$/;

export const GITHUB_URL_REGEX =
  /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)?\/?$/;

export const REGEX = {
  USERNAME: USERNAME_REGEX,
  SLUG: SLUG_REGEX,
  URL: URL_REGEX,
  GITHUB_URL: GITHUB_URL_REGEX,
} as const;
