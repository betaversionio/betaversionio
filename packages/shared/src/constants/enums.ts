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

// ─── BlogStatus ─────────────────────────────────────────────────────────────

export enum BlogStatus {
  Draft = "Draft",
  Published = "Published",
  Archived = "Archived",
}

export const BlogStatusSchema = z.nativeEnum(BlogStatus);

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

// ─── ProjectPhase ───────────────────────────────────────────────────────────

export enum ProjectPhase {
  Idea = "Idea",
  Development = "Development",
  Beta = "Beta",
  Production = "Production",
  Maintenance = "Maintenance",
  Sunset = "Sunset",
}

export const ProjectPhaseSchema = z.nativeEnum(ProjectPhase);

// ─── ProductionType ─────────────────────────────────────────────────────────

export enum ProductionType {
  Hobby = "Hobby",
  Startup = "Startup",
  Enterprise = "Enterprise",
  OpenSource = "OpenSource",
  Research = "Research",
  Freelance = "Freelance",
}

export const ProductionTypeSchema = z.nativeEnum(ProductionType);

// ─── EmploymentType ─────────────────────────────────────────────────────────

export enum EmploymentType {
  FullTime = "FullTime",
  PartTime = "PartTime",
  Contract = "Contract",
  Freelance = "Freelance",
  Internship = "Internship",
}

export const EmploymentTypeSchema = z.nativeEnum(EmploymentType);

// ─── InvitationStatus ──────────────────────────────────────────────────────

export enum InvitationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Cancelled = "Cancelled",
}

export const InvitationStatusSchema = z.nativeEnum(InvitationStatus);

// ─── NotificationType ──────────────────────────────────────────────────────

export enum NotificationType {
  ProjectComment = "ProjectComment",
  ProjectVote = "ProjectVote",
  ProjectReview = "ProjectReview",
  ProjectInvitation = "ProjectInvitation",
  InvitationAccepted = "InvitationAccepted",
  ProjectBookmark = "ProjectBookmark",
  ProjectUpdate = "ProjectUpdate",
  LaunchDay = "LaunchDay",
  NewFollower = "NewFollower",
}

export const NotificationTypeSchema = z.nativeEnum(NotificationType);
