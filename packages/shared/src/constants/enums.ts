import { z } from "zod";

// ─── SocialPlatform ──────────────────────────────────────────────────────────

export enum SocialPlatform {
  Github = "Github",
  Linkedin = "Linkedin",
  Twitter = "Twitter",
  Website = "Website",
  Devto = "Devto",
  Youtube = "Youtube",
  Dribbble = "Dribbble",
  Behance = "Behance",
}

export const SocialPlatformSchema = z.nativeEnum(SocialPlatform);

// ─── TechCategory ────────────────────────────────────────────────────────────

export enum TechCategory {
  Language = "Language",
  Framework = "Framework",
  Database = "Database",
  Devops = "Devops",
  Tool = "Tool",
  Cloud = "Cloud",
  Mobile = "Mobile",
  AiMl = "AiMl",
  Other = "Other",
}

export const TechCategorySchema = z.nativeEnum(TechCategory);

// ─── Proficiency ─────────────────────────────────────────────────────────────

export enum Proficiency {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
}

export const ProficiencySchema = z.nativeEnum(Proficiency);

// ─── ProjectStatus ───────────────────────────────────────────────────────────

export enum ProjectStatus {
  Draft = "Draft",
  Active = "Active",
  Completed = "Completed",
  Archived = "Archived",
}

export const ProjectStatusSchema = z.nativeEnum(ProjectStatus);

// ─── CollaboratorRole ────────────────────────────────────────────────────────

export enum CollaboratorRole {
  Owner = "Owner",
  Maintainer = "Maintainer",
  Contributor = "Contributor",
}

export const CollaboratorRoleSchema = z.nativeEnum(CollaboratorRole);

// ─── MediaType ───────────────────────────────────────────────────────────────

export enum MediaType {
  Image = "Image",
  Video = "Video",
  Document = "Document",
  Link = "Link",
}

export const MediaTypeSchema = z.nativeEnum(MediaType);

// ─── PostType ────────────────────────────────────────────────────────────────

export enum PostType {
  Text = "Text",
  Article = "Article",
  Snippet = "Snippet",
  Milestone = "Milestone",
  Link = "Link",
}

export const PostTypeSchema = z.nativeEnum(PostType);

// ─── ReactionType ────────────────────────────────────────────────────────────

export enum ReactionType {
  Like = "Like",
  Celebrate = "Celebrate",
  Insightful = "Insightful",
  Curious = "Curious",
  Support = "Support",
}

export const ReactionTypeSchema = z.nativeEnum(ReactionType);

// ─── IdeaStage ───────────────────────────────────────────────────────────────

export enum IdeaStage {
  Concept = "Concept",
  Planning = "Planning",
  SeekingTeam = "SeekingTeam",
  InProgress = "InProgress",
  Launched = "Launched",
}

export const IdeaStageSchema = z.nativeEnum(IdeaStage);

// ─── Commitment ──────────────────────────────────────────────────────────────

export enum Commitment {
  FullTime = "FullTime",
  PartTime = "PartTime",
  Flexible = "Flexible",
  OneTime = "OneTime",
}

export const CommitmentSchema = z.nativeEnum(Commitment);

// ─── Compensation ────────────────────────────────────────────────────────────

export enum Compensation {
  Paid = "Paid",
  Equity = "Equity",
  Volunteer = "Volunteer",
  Negotiable = "Negotiable",
}

export const CompensationSchema = z.nativeEnum(Compensation);

// ─── ApplicationStatus ───────────────────────────────────────────────────────

export enum ApplicationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Withdrawn = "Withdrawn",
}

export const ApplicationStatusSchema = z.nativeEnum(ApplicationStatus);
