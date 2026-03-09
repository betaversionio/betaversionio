import { BetaVersionClient, PortfolioData } from '@betaversionio/portfolio-sdk';
import { headers } from 'next/headers';
import { IProject } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1';
const ENV_USERNAME = process.env.NEXT_PUBLIC_PORTFOLIO_USERNAME || undefined;

const client = new BetaVersionClient({ apiUrl: API_URL });

export async function getPortfolioData(): Promise<PortfolioData | null> {
    try {
        // Resolve username: env var first, then x-portfolio-username header (set by proxy)
        let username = ENV_USERNAME;
        if (!username) {
            const hdrs = await headers();
            username = hdrs.get('x-portfolio-username') ?? undefined;
        }
        return await client.getPortfolio(username);
    } catch {
        return null;
    }
}

export function mapGeneralInfo(data: PortfolioData) {
    const user = data.user;
    return {
        email: user.email ?? '',
        emailSubject: "Let's collaborate on a project",
        emailBody: `Hi ${user.name ?? user.username}, I am reaching out to you because...`,
    };
}

export function mapSocialLinks(data: PortfolioData) {
    return data.user.socialLinks.map((link) => ({
        name: link.platform.toLowerCase(),
        url: link.url,
    }));
}

export function mapStack(data: PortfolioData) {
    // Group tech stack by category if available, otherwise list all as "skills"
    const techs = data.user.techStack ?? [];
    const skills: Record<string, { name: string; icon: string }[]> = {};

    for (const tech of techs) {
        const category = tech.category?.toLowerCase() ?? 'skills';
        if (!skills[category]) skills[category] = [];
        skills[category].push({
            name: tech.name,
            icon: `/logo/${tech.name.toLowerCase().replace(/[.\s]+/g, '-')}.png`,
        });
    }

    // If no categories, put all under "skills"
    if (Object.keys(skills).length === 0) {
        return { skills: [] };
    }

    return skills;
}

export function mapProjects(data: PortfolioData): IProject[] {
    return data.projects.map((p) => ({
        title: p.title,
        slug: p.slug,
        year: p.launchDate
            ? new Date(p.launchDate).getFullYear()
            : new Date(p.createdAt).getFullYear(),
        description: p.description ?? '',
        role: '',
        techStack: p.techStack ?? p.tags ?? [],
        thumbnail: p.images[0] ?? p.logo ?? '',
        longThumbnail: p.images[0] ?? p.logo ?? '',
        images: p.images,
        liveUrl: p.demoUrl ?? undefined,
        sourceCode: undefined,
    }));
}

export function mapExperience(data: PortfolioData) {
    return (data.user.experiences ?? []).map((exp) => {
        const start = new Date(exp.startDate).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
        const end = exp.current
            ? 'Present'
            : exp.endDate
              ? new Date(exp.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                })
              : '';
        return {
            title: exp.position,
            company: exp.company,
            duration: `${start} - ${end}`,
        };
    });
}
