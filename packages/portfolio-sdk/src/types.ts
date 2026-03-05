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

export interface PortfolioData {
  user: PortfolioUser;
  projects: PortfolioProject[];
  blogs: PortfolioBlog[];
  resume: PortfolioResume | null;
  followCounts: FollowCounts;
}
