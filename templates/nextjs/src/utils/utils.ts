/**
 * Converts API data into the post format expected by Magic Portfolio components.
 * Replaces the original filesystem-based getPosts().
 */

import { fetchPortfolio, fetchProject, fetchBlog } from "@/lib/api";
import type { PortfolioProject, PortfolioBlog } from "@/lib/api";

export type PostMetadata = {
  title: string;
  subtitle?: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Array<{ name: string; role: string; avatar: string; linkedIn: string }>;
  link?: string;
};

export type Post = {
  metadata: PostMetadata;
  slug: string;
  content: string;
};

function projectToPost(project: PortfolioProject): Post {
  return {
    metadata: {
      title: project.title,
      publishedAt: project.createdAt,
      summary: project.tagline ?? project.description.slice(0, 200),
      image: project.images[0] ?? project.logo ?? "",
      images: project.images,
      team: [],
      link: project.demoUrl ?? project.links[0] ?? "",
    },
    slug: project.slug,
    content: project.description,
  };
}

function blogToPost(blog: PortfolioBlog): Post {
  return {
    metadata: {
      title: blog.title,
      publishedAt: blog.createdAt,
      summary: blog.excerpt ?? blog.content.slice(0, 200),
      image: blog.coverImage ?? "",
      images: blog.coverImage ? [blog.coverImage] : [],
      tag: blog.tags[0] ?? "",
      team: [],
    },
    slug: blog.slug,
    content: blog.content,
  };
}

export async function getProjects(): Promise<Post[]> {
  const data = await fetchPortfolio();
  if (!data) return [];
  return data.projects.map(projectToPost);
}

export async function getBlogs(): Promise<Post[]> {
  const data = await fetchPortfolio();
  if (!data) return [];
  return data.blogs.map(blogToPost);
}

export async function getProjectBySlug(slug: string): Promise<Post | null> {
  const project = await fetchProject(slug);
  if (!project) return null;
  return projectToPost(project);
}

export async function getBlogBySlug(slug: string): Promise<Post | null> {
  const blog = await fetchBlog(slug);
  if (!blog) return null;
  return blogToPost(blog);
}

/**
 * @deprecated Kept for backward compat — returns empty.
 * Use getProjects() or getBlogs() instead.
 */
export function getPosts(_customPath?: string[]): Post[] {
  return [];
}
