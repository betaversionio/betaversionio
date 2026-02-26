import type { FullProfile } from "@/hooks/queries";
import type { ResumeUserData } from "../templates";

export function profileToResumeData(profile: FullProfile): ResumeUserData {
  return {
    name: profile.name || profile.username,
    email: profile.email,
    location: profile.profile?.location ?? undefined,
    website: profile.profile?.website ?? undefined,
    headline: profile.profile?.headline ?? undefined,
    bio: profile.profile?.bio ?? undefined,
    socialLinks: profile.socialLinks,
    education: profile.education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy ?? undefined,
      startDate: edu.startDate,
      endDate: edu.endDate ?? undefined,
      current: edu.current,
      description: edu.description ?? undefined,
    })),
    experience: profile.experiences.map((exp) => ({
      company: exp.company,
      position: exp.position,
      location: exp.location ?? undefined,
      startDate: exp.startDate,
      endDate: exp.endDate ?? undefined,
      current: exp.current,
      description: exp.description ?? undefined,
    })),
    skills: profile.techStack.map((ts) => ({
      name: ts.name,
      category: ts.category,
      proficiency: ts.proficiency,
    })),
    services: profile.services.map((svc) => ({
      title: svc.title,
      description: svc.description ?? undefined,
    })),
    projects: (profile.projects ?? []).map((proj) => ({
      title: proj.title,
      tagline: proj.tagline ?? undefined,
      url: proj.demoUrl ?? proj.links?.[0] ?? undefined,
      techStack: proj.techStack ?? [],
    })),
  };
}
