import { notFound } from 'next/navigation';
import ProjectDetails from './_components/ProjectDetails';
import { getPortfolioData, mapProjects } from '@/lib/data';
import { Metadata } from 'next';

export const generateStaticParams = async () => {
    const data = await getPortfolioData();
    if (!data) return [];
    return mapProjects(data).map((project) => ({ slug: project.slug }));
};

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
    const { slug } = await params;
    const data = await getPortfolioData();
    if (!data) return {};

    const projects = mapProjects(data);
    const project = projects.find((p) => p.slug === slug);

    return {
        title: project
            ? `${project.title} - ${project.techStack.slice(0, 3).join(', ')}`
            : 'Project',
        description: project?.description,
    };
};

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    const data = await getPortfolioData();
    if (!data) return notFound();

    const projects = mapProjects(data);
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
        return notFound();
    }

    return <ProjectDetails project={project} />;
};

export default Page;
