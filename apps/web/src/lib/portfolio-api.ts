const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const json = await res.json();

    // Unwrap { success, data } wrapper
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return (json as ApiResponse<T>).data;
    }

    return json as T;
  } catch {
    return null;
  }
}

async function fetchApiList<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json = await res.json();

    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      const data = (json as ApiResponse<unknown>).data;
      // Paginated response: { items, meta }
      if (data && typeof data === 'object' && 'items' in data) {
        return (data as { items: T[] }).items;
      }
      return data as T[];
    }

    if (json && typeof json === 'object' && 'items' in json) {
      return (json as { items: T[] }).items;
    }

    return json as T[];
  } catch {
    return [];
  }
}

// ─── Types (matching API responses) ──────────────────────────────────────────

export interface PortfolioUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profile: {
    bio: string | null;
    headline: string | null;
    location: string | null;
    website: string | null;
    portfolioTemplateId: string | null;
  } | null;
  socialLinks: Array<{ platform: string; url: string }>;
  techStack: Array<{
    name: string;
    category: string;
    proficiency: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    techStack: string[];
    status: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string | null;
    employmentType: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
  }>;
  services: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  logo: string | null;
  tagline: string | null;
  description: string;
  links: string[];
  isOpenSource: boolean;
  images: string[];
  techStack: string[];
  tags: string[];
  status: string;
  phase: string;
  demoUrl: string | null;
  videoUrl: string | null;
  launchDate: string | null;
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  reviewsCount: number;
  viewsCount: number;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  tags: string[];
  status: string;
  upvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioResume {
  id: string;
  title: string;
  pdfUrl: string | null;
  generatedAt: string | null;
}

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

// ─── Fetchers ────────────────────────────────────────────────────────────────

export function fetchPortfolioUser(username: string) {
  return fetchApi<PortfolioUser>(`/users/${username}`);
}

export function fetchPortfolioProjects(authorId: string) {
  return fetchApiList<PortfolioProject>(
    `/projects?authorId=${authorId}&status=Published`,
  );
}

export function fetchPortfolioBlogs(authorId: string) {
  return fetchApiList<PortfolioBlog>(
    `/blogs?authorId=${authorId}&status=Published`,
  );
}

export function fetchPortfolioResume(username: string) {
  return fetchApi<PortfolioResume>(`/resumes/u/${username}`);
}

export function fetchFollowCounts(userId: string) {
  return fetchApi<FollowCounts>(`/follows/${userId}/counts`);
}

export function fetchPortfolioProject(slug: string) {
  return fetchApi<PortfolioProject>(`/projects/${slug}`);
}

export function fetchPortfolioBlog(slug: string) {
  return fetchApi<PortfolioBlog>(`/blogs/${slug}`);
}
