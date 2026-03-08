import type { MetadataRoute } from 'next';
import { getPortfolioData, mapProjects } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await getPortfolioData();
    const baseUrl = data?.user.profile?.website ?? 'https://example.com';
    const projects = data ? mapProjects(data) : [];

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        ...projects.map((project) => ({
            url: `${baseUrl}/projects/${project.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ];
}
