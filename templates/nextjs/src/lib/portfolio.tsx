/**
 * Converts API PortfolioData into the shapes Magic Portfolio's
 * pages and components expect (Person, Social, About, Home, etc.)
 */
import type { PortfolioData } from '@/lib/api';
import type { Person, Social, Home, About } from '@/types';

const employmentTypeLabels: Record<string, string> = {
  FullTime: 'Full-time',
  PartTime: 'Part-time',
  Contract: 'Contract',
  Freelance: 'Freelance',
  Internship: 'Internship',
};

function formatDateRange(
  start: string,
  end: string | null,
  current: boolean,
): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(start)} — ${current ? 'Present' : end ? fmt(end) : ''}`;
}

export function toPerson(data: PortfolioData): Person {
  const user = data.user;
  const nameParts = (user.name ?? user.username).split(' ');
  return {
    firstName: nameParts[0] ?? '',
    lastName: nameParts.slice(1).join(' '),
    name: user.name ?? user.username,
    role: user.profile?.headline ?? '',
    avatar: user.avatarUrl ?? '',
    email: user.email ?? '',
    location: (user.profile?.location as any) ?? user.name,
    languages: [],
  };
}

const platformIcons: Record<string, string> = {
  Github: 'github',
  Linkedin: 'linkedin',
  Twitter: 'x',
  Instagram: 'instagram',
  Website: 'globe',
  Devto: 'code',
  Youtube: 'youtube',
  Dribbble: 'dribbble',
  Behance: 'behance',
};

export function toSocial(data: PortfolioData): Social {
  return data.user.socialLinks.map((link) => ({
    name: link.platform,
    icon: (platformIcons[link.platform] ?? 'link') as any,
    link: link.url,
    essential: true,
  }));
}

export function toHome(data: PortfolioData): Home {
  const person = toPerson(data);
  const bio = data.user.profile?.bio ?? '';
  return {
    path: '/',
    image: person.avatar,
    label: 'Home',
    title: `${person.name}'s Portfolio`,
    description: `Portfolio of ${person.name} — ${person.role}`,
    headline: <>{person.role || `${person.name}'s Portfolio`}</>,
    featured: {
      display: false,
      title: <></>,
      href: '/work',
    },
    subline: <>{bio}</>,
  };
}

export function toAbout(data: PortfolioData): About {
  const person = toPerson(data);
  const bio = data.user.profile?.bio ?? '';

  return {
    path: '/about',
    label: 'About',
    title: `About — ${person.name}`,
    description: `About ${person.name}`,
    tableOfContent: { display: true, subItems: false },
    avatar: { display: true },
    calendar: { display: false, link: '' },
    intro: {
      display: !!bio,
      title: 'Introduction',
      description: <>{bio}</>,
    },
    work: {
      display: data.user.experiences.length > 0,
      title: 'Work Experience',
      experiences: data.user.experiences.map((exp) => ({
        company: exp.company,
        timeframe: formatDateRange(exp.startDate, exp.endDate, exp.current),
        role: `${exp.position} · ${employmentTypeLabels[exp.employmentType] ?? exp.employmentType}`,
        achievements: exp.description
          ? exp.description
              .split('\n')
              .filter(Boolean)
              .map((line) => <>{line}</>)
          : [],
        images: [],
      })),
    },
    studies: {
      display: data.user.education.length > 0,
      title: 'Education',
      institutions: data.user.education.map((edu) => ({
        name: edu.institution,
        description: (
          <>
            {edu.degree}
            {edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}
            {' · '}
            {formatDateRange(edu.startDate, edu.endDate, edu.current)}
          </>
        ),
      })),
    },
    technical: {
      display: data.user.techStack.length > 0,
      title: 'Technical Skills',
      skills: Object.entries(
        data.user.techStack.reduce<Record<string, typeof data.user.techStack>>(
          (acc, tech) => {
            const cat = tech.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(tech);
            return acc;
          },
          {},
        ),
      ).map(([category, techs]) => ({
        title: category,
        description: undefined,
        tags: techs.map((t) => ({ name: t.name })),
        images: [],
      })),
    },
  };
}
