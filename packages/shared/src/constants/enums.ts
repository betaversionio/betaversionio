import { z } from "zod";

// ─── SocialPlatform ──────────────────────────────────────────────────────────

export enum SocialPlatform {
  GITHUB = "GITHUB",
  LINKEDIN = "LINKEDIN",
  TWITTER = "TWITTER",
  WEBSITE = "WEBSITE",
  DEVTO = "DEVTO",
  YOUTUBE = "YOUTUBE",
  DRIBBBLE = "DRIBBBLE",
  BEHANCE = "BEHANCE",
}

export const SocialPlatformSchema = z.nativeEnum(SocialPlatform);

// ─── TechCategory ────────────────────────────────────────────────────────────

export enum TechCategory {
  LANGUAGE = "LANGUAGE",
  FRAMEWORK = "FRAMEWORK",
  DATABASE = "DATABASE",
  DEVOPS = "DEVOPS",
  TOOL = "TOOL",
  CLOUD = "CLOUD",
  MOBILE = "MOBILE",
  AI_ML = "AI_ML",
  OTHER = "OTHER",
}

export const TechCategorySchema = z.nativeEnum(TechCategory);

// ─── Proficiency ─────────────────────────────────────────────────────────────

export enum Proficiency {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

export const ProficiencySchema = z.nativeEnum(Proficiency);

// ─── ProjectStatus ───────────────────────────────────────────────────────────

export enum ProjectStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export const ProjectStatusSchema = z.nativeEnum(ProjectStatus);

// ─── CollaboratorRole ────────────────────────────────────────────────────────

export enum CollaboratorRole {
  OWNER = "OWNER",
  MAINTAINER = "MAINTAINER",
  CONTRIBUTOR = "CONTRIBUTOR",
}

export const CollaboratorRoleSchema = z.nativeEnum(CollaboratorRole);

// ─── MediaType ───────────────────────────────────────────────────────────────

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  LINK = "LINK",
}

export const MediaTypeSchema = z.nativeEnum(MediaType);

// ─── PostType ────────────────────────────────────────────────────────────────

export enum PostType {
  TEXT = "TEXT",
  ARTICLE = "ARTICLE",
  SNIPPET = "SNIPPET",
  MILESTONE = "MILESTONE",
  LINK = "LINK",
}

export const PostTypeSchema = z.nativeEnum(PostType);

// ─── ReactionType ────────────────────────────────────────────────────────────

export enum ReactionType {
  LIKE = "LIKE",
  CELEBRATE = "CELEBRATE",
  INSIGHTFUL = "INSIGHTFUL",
  CURIOUS = "CURIOUS",
  SUPPORT = "SUPPORT",
}

export const ReactionTypeSchema = z.nativeEnum(ReactionType);

// ─── IdeaStage ───────────────────────────────────────────────────────────────

export enum IdeaStage {
  CONCEPT = "CONCEPT",
  PLANNING = "PLANNING",
  SEEKING_TEAM = "SEEKING_TEAM",
  IN_PROGRESS = "IN_PROGRESS",
  LAUNCHED = "LAUNCHED",
}

export const IdeaStageSchema = z.nativeEnum(IdeaStage);

// ─── Commitment ──────────────────────────────────────────────────────────────

export enum Commitment {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  FLEXIBLE = "FLEXIBLE",
  ONE_TIME = "ONE_TIME",
}

export const CommitmentSchema = z.nativeEnum(Commitment);

// ─── Compensation ────────────────────────────────────────────────────────────

export enum Compensation {
  PAID = "PAID",
  EQUITY = "EQUITY",
  VOLUNTEER = "VOLUNTEER",
  NEGOTIABLE = "NEGOTIABLE",
}

export const CompensationSchema = z.nativeEnum(Compensation);

// ─── ApplicationStatus ───────────────────────────────────────────────────────

export enum ApplicationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export const ApplicationStatusSchema = z.nativeEnum(ApplicationStatus);
