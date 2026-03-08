import React, { Component } from 'react';
import { usePortfolio } from '../../lib/portfolio-context';

function NavLinks({ active_screen, changeScreen, hasResume }) {
    return (
        <>
            <div id="about" tabIndex="0" onFocus={changeScreen} className={(active_screen === "about" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                <img className=" w-3 md:w-4" alt="about" src="./themes/Yaru/status/about.svg" />
                <span className=" ml-1 md:ml-2 text-gray-50 ">About Me</span>
            </div>
            <div id="education" tabIndex="0" onFocus={changeScreen} className={(active_screen === "education" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                <img className=" w-3 md:w-4" alt="education" src="./themes/Yaru/status/education.svg" />
                <span className=" ml-1 md:ml-2 text-gray-50 ">Education</span>
            </div>
            <div id="experience" tabIndex="0" onFocus={changeScreen} className={(active_screen === "experience" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                <img className=" w-3 md:w-4" alt="experience" src="./themes/Yaru/status/projects.svg" />
                <span className=" ml-1 md:ml-2 text-gray-50 ">Experience</span>
            </div>
            <div id="skills" tabIndex="0" onFocus={changeScreen} className={(active_screen === "skills" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                <img className=" w-3 md:w-4" alt="skills" src="./themes/Yaru/status/skills.svg" />
                <span className=" ml-1 md:ml-2 text-gray-50 ">Skills</span>
            </div>
            <div id="projects" tabIndex="0" onFocus={changeScreen} className={(active_screen === "projects" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                <img className=" w-3 md:w-4" alt="projects" src="./themes/Yaru/status/projects.svg" />
                <span className=" ml-1 md:ml-2 text-gray-50 ">Projects</span>
            </div>
            {hasResume && (
                <div id="resume" tabIndex="0" onFocus={changeScreen} className={(active_screen === "resume" ? " bg-ub-orange bg-opacity-100 hover:bg-opacity-95" : " hover:bg-gray-50 hover:bg-opacity-5 ") + " w-28 md:w-full md:rounded-none rounded-sm cursor-default outline-none py-1.5 focus:outline-none duration-100 my-0.5 flex justify-start items-center pl-2 md:pl-2.5"}>
                    <img className=" w-3 md:w-4" alt="resume" src="./themes/Yaru/status/download.svg" />
                    <span className=" ml-1 md:ml-2 text-gray-50 ">Resume</span>
                </div>
            )}
        </>
    );
}

function AboutVivekInner() {
    const { data } = usePortfolio();
    const hasResume = !!(data?.resume?.pdfUrl);
    return <AboutVivek hasResume={hasResume} />;
}

export class AboutVivek extends Component {

    constructor(props) {
        super(props);
        this.screens = {};
        this.state = {
            screen: () => { },
            active_screen: "about",
            navbar: false,
        }
    }

    componentDidMount() {
        this.screens = {
            "about": <About />,
            "education": <Education />,
            "experience": <Experience />,
            "skills": <Skills />,
            "projects": <Projects />,
            "resume": <Resume />,
        }

        let lastVisitedScreen = localStorage.getItem("about-section");
        if (lastVisitedScreen === null || lastVisitedScreen === undefined) {
            lastVisitedScreen = "about";
        }

        // If resume tab was last visited but no resume available, fall back to about
        if (lastVisitedScreen === "resume" && !this.props.hasResume) {
            lastVisitedScreen = "about";
        }

        const el = document.getElementById(lastVisitedScreen);
        if (el) this.changeScreen(el);
    }

    changeScreen = (e) => {
        const screen = e.id || e.target.id;
        localStorage.setItem("about-section", screen);
        this.setState({
            screen: this.screens[screen],
            active_screen: screen
        });
    }

    showNavBar = () => {
        this.setState({ navbar: !this.state.navbar });
    }

    render() {
        return (
            <div className="w-full h-full flex bg-ub-cool-grey text-white select-none relative">
                <div className="md:flex hidden flex-col w-1/4 md:w-1/5 text-sm overflow-y-auto windowMainScreen border-r border-black">
                    <NavLinks active_screen={this.state.active_screen} changeScreen={this.changeScreen} hasResume={this.props.hasResume} />
                </div>
                <div onClick={this.showNavBar} className="md:hidden flex flex-col items-center justify-center absolute bg-ub-cool-grey rounded w-6 h-6 top-1 left-1">
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className=" w-3.5 border-t border-white" style={{ marginTop: "2pt", marginBottom: "2pt" }}></div>
                    <div className=" w-3.5 border-t border-white"></div>
                    <div className={(this.state.navbar ? " visible animateShow z-30 " : " invisible ") + " md:hidden text-xs absolute bg-ub-cool-grey py-0.5 px-1 rounded-sm top-full mt-1 left-0 shadow border-black border border-opacity-20"}>
                        <NavLinks active_screen={this.state.active_screen} changeScreen={this.changeScreen} hasResume={this.props.hasResume} />
                    </div>
                </div>
                <div className="flex flex-col w-3/4 md:w-4/5 justify-start items-center flex-grow bg-ub-grey overflow-y-auto windowMainScreen">
                    {this.state.screen}
                </div>
            </div>
        );
    }
}

export default AboutVivek;

export const displayAboutVivek = () => {
    return <AboutVivekInner />;
}


function About() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const { user } = data;
    const name = user.name || user.username;
    const headline = user.profile?.headline || 'Developer';
    const bio = user.profile?.bio || '';

    return (
        <>
            <div className="w-20 md:w-28 my-4 bg-white rounded-lg overflow-hidden">
                {user.avatarUrl ? (
                    <img className="w-full aspect-square object-cover" src={user.avatarUrl} alt={name} />
                ) : (
                    <div className="w-full aspect-square bg-gray-600 flex items-center justify-center text-2xl font-bold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="mt-4 md:mt-8 text-lg md:text-2xl text-center px-1">
                <div>my name is <span className="font-bold">{name}</span> ,</div>
                <div className="font-normal ml-1">I&apos;m a <span className="text-pink-600 font-bold">{headline}!</span></div>
            </div>
            <div className="mt-4 relative md:my-8 pt-px bg-white w-32 md:w-48">
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-0"></div>
                <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-0"></div>
            </div>
            {bio && (
                <ul className="mt-4 leading-tight tracking-tight text-sm md:text-base w-5/6 md:w-3/4 emoji-list">
                    {bio.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i} className="mt-3 list-disc">{line}</li>
                    ))}
                </ul>
            )}
            {user.email && (
                <div className="mt-4 text-sm text-gray-300">
                    Contact: <a className="text-ubt-gedit-orange hover:underline" href={`mailto:${user.email}`}>{user.email}</a>
                </div>
            )}
        </>
    )
}

function Education() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const { user } = data;

    if (!user.education || user.education.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">No education info yet.</div>;
    }

    return (
        <>
            <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Education
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className="w-10/12 mt-4 ml-4 px-0 md:px-1">
                {user.education.map((edu) => {
                    const startYear = new Date(edu.startDate).getFullYear();
                    const endYear = edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : '';
                    return (
                        <li key={edu.id} className="list-disc mt-4">
                            <div className="text-lg md:text-xl text-left font-bold leading-tight">
                                {edu.institution}
                            </div>
                            <div className="text-sm text-gray-400 mt-0.5">{startYear} - {endYear}</div>
                            <div className="text-sm md:text-base">
                                {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                            </div>
                            {edu.description && (
                                <div className="text-sm text-gray-300 mt-1">{edu.description}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </>
    )
}

function Experience() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const { user } = data;

    if (!user.experiences || user.experiences.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">No experience info yet.</div>;
    }

    return (
        <>
            <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Experience
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <ul className="w-10/12 mt-4 ml-4 px-0 md:px-1">
                {user.experiences.map((exp) => {
                    const startDate = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const endDate = exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
                    return (
                        <li key={exp.id} className="list-disc mt-4">
                            <div className="text-lg md:text-xl text-left font-bold leading-tight">
                                {exp.position}
                            </div>
                            <div className="text-sm text-ubt-gedit-orange mt-0.5">{exp.company}</div>
                            <div className="text-sm text-gray-400 mt-0.5">{startDate} — {endDate}</div>
                            {exp.description && (
                                <div className="text-sm text-gray-300 mt-1">{exp.description}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </>
    )
}

function Skills() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const { user } = data;

    if (!user.techStack || user.techStack.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">No skills info yet.</div>;
    }

    return (
        <>
            <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Technical Skills
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>
            <div className="w-full md:w-10/12 flex flex-wrap justify-center items-start mt-4 gap-2 px-4">
                {user.techStack.map((tech, i) => {
                    const profColors = {
                        'Expert': 'text-green-400 border-green-400',
                        'Advanced': 'text-blue-400 border-blue-400',
                        'Intermediate': 'text-yellow-400 border-yellow-400',
                        'Beginner': 'text-gray-400 border-gray-400',
                    };
                    const colorClass = profColors[tech.proficiency] || 'text-gray-300 border-gray-300';
                    return (
                        <span key={i} className={`px-2 py-1 border rounded-full text-xs ${colorClass}`}>
                            {tech.name}
                        </span>
                    );
                })}
            </div>
            {user.services && user.services.length > 0 && (
                <div className="w-10/12 mt-8">
                    <div className="font-medium text-lg mb-3">What I Do</div>
                    <ul className="text-sm leading-relaxed">
                        {user.services.map((svc) => (
                            <li key={svc.id} className="list-disc ml-4 mt-2">
                                <span className="font-medium text-ubt-gedit-orange">{svc.title}</span>
                                {svc.description && <span className="text-gray-300"> - {svc.description}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

function Projects() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const { projects } = data;

    if (!projects || projects.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">No projects yet.</div>;
    }

    const tagColors = [
        'yellow-300', 'blue-400', 'green-400', 'pink-400', 'purple-500',
        'red-400', 'indigo-400', 'teal-400', 'orange-400', 'cyan-400',
    ];

    return (
        <>
            <div className="font-medium relative text-2xl mt-2 md:mt-4 mb-4">
                Projects
                <div className="absolute pt-px bg-white mt-px top-full w-full">
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 left-full"></div>
                    <div className="bg-white absolute rounded-full p-0.5 md:p-1 top-0 transform -translate-y-1/2 right-full"></div>
                </div>
            </div>

            {projects.map((project) => {
                const link = project.demoUrl || '#';
                const date = project.launchDate
                    ? new Date(project.launchDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                return (
                    <a key={project.id} href={link} target="_blank" rel="noreferrer" className="flex w-full flex-col px-4">
                        <div className="w-full py-1 px-2 my-2 border border-gray-50 border-opacity-10 rounded hover:bg-gray-50 hover:bg-opacity-5 cursor-pointer">
                            <div className="flex flex-wrap justify-between items-center">
                                <div className="flex justify-center items-center">
                                    <div className="text-base md:text-lg mr-2">{project.title.toLowerCase()}</div>
                                </div>
                                <div className="text-gray-300 font-light text-sm">{date}</div>
                            </div>
                            {project.tagline && (
                                <p className="text-sm text-gray-100 ml-4 mt-1">{project.tagline}</p>
                            )}
                            <div className="flex flex-wrap items-start justify-start text-xs py-2">
                                {project.tags.map((tag, i) => {
                                    const color = tagColors[i % tagColors.length];
                                    return (
                                        <span key={i} className={`px-1.5 py-0.5 w-max border border-${color} text-${color} m-1 rounded-full`}>
                                            {tag}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </a>
                );
            })}
        </>
    )
}

function Resume() {
    const { data, loading } = usePortfolio();

    if (loading || !data) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const pdfUrl = data.resume?.pdfUrl;

    if (!pdfUrl) {
        return <div className="w-full h-full flex items-center justify-center text-gray-400">No resume available.</div>;
    }

    return (
        <iframe className="h-full w-full" src={pdfUrl} title="Resume" frameBorder="0"></iframe>
    )
}
