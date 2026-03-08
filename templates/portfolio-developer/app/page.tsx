import AboutMe from './_components/AboutMe';
import Banner from './_components/Banner';
import Experiences from './_components/Experiences';
import Skills from './_components/Skills';
import ProjectList from './_components/ProjectList';
import {
    getPortfolioData,
    mapGeneralInfo,
    mapStack,
    mapExperience,
    mapProjects,
} from '@/lib/data';

export default async function Home() {
    const data = await getPortfolioData();

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Failed to load portfolio data.
            </div>
        );
    }

    const user = data.user;
    const generalInfo = mapGeneralInfo(data);
    const stack = mapStack(data);
    const experience = mapExperience(data);
    const projects = mapProjects(data);

    return (
        <div className="page-">
            <Banner
                name={user.name ?? user.username}
                headline={user.profile?.headline ?? 'Developer'}
                bio={user.profile?.bio ?? ''}
                email={generalInfo.email}
                projectCount={projects.length}
            />
            <AboutMe
                name={user.name ?? user.username}
                bio={user.profile?.bio ?? ''}
            />
            <Skills stack={stack} />
            <Experiences experience={experience} />
            <ProjectList projects={projects} />
        </div>
    );
}
