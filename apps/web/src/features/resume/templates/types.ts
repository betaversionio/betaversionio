export interface ResumeUserData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  headline?: string;
  bio?: string;
  socialLinks: Array<{ platform: string; url: string }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  skills: Array<{
    name: string;
    category?: string;
    proficiency?: string;
  }>;
  services: Array<{
    title: string;
    description?: string;
  }>;
  projects: Array<{
    title: string;
    tagline?: string;
    url?: string;
    techStack: string[];
  }>;
}

export interface ResumeTemplateConfig {
  id: string;
  name: string;
  description: string;
  generate: (data: ResumeUserData) => string;
}
