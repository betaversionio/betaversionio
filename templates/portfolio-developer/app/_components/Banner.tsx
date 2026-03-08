'use client';
import ArrowAnimation from '@/components/ArrowAnimation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import React from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface BannerProps {
    name: string;
    headline: string;
    bio: string;
    email: string;
    projectCount: number;
}

const Banner = ({ name, headline, bio, email, projectCount }: BannerProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'bottom 70%',
                    end: 'bottom 10%',
                    scrub: 1,
                },
            });

            tl.fromTo(
                '.slide-up-and-fade',
                { y: 0 },
                { y: -150, opacity: 0, stagger: 0.02 },
            );
        },
        { scope: containerRef },
    );

    return (
        <section className="relative overflow-hidden" id="banner">
            <ArrowAnimation />
            <div
                className="container h-[100svh] min-h-[530px] max-md:pb-10 flex justify-between items-center max-md:flex-col"
                ref={containerRef}
            >
                <div className="max-md:grow max-md:flex flex-col justify-center items-start max-w-[544px]">
                    <h1 className="banner-title slide-up-and-fade leading-[.95] text-6xl sm:text-[80px] font-anton">
                        <span className="text-primary">{headline.split(' ')[0]?.toUpperCase()}</span>
                        <br /> <span className="ml-4">{headline.split(' ').slice(1).join(' ').toUpperCase() || 'DEVELOPER'}</span>
                    </h1>
                    <p className="banner-description slide-up-and-fade mt-6 text-lg text-muted-foreground">
                        Hi! I&apos;m{' '}
                        <span className="font-medium text-foreground">
                            {name}
                        </span>
                        . {bio ? bio.split('\n')[0] : `A creative ${headline} building high-performance web solutions.`}
                    </p>
                    {email && (
                        <a
                            href={`mailto:${email}`}
                            className="mt-9 banner-button slide-up-and-fade inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Get in Touch
                        </a>
                    )}
                </div>

                <div className="md:absolute bottom-[10%] right-[4%] flex md:flex-col gap-4 md:gap-8 text-center md:text-right">
                    {projectCount > 0 && (
                        <div className="slide-up-and-fade">
                            <h5 className="text-3xl sm:text-4xl font-anton text-primary mb-1.5">
                                {projectCount}+
                            </h5>
                            <p className="text-muted-foreground">
                                Completed Projects
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Banner;
