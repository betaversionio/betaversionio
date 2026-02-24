import type { Metadata } from 'next';
import {
  Code2,
  Globe,
  Lightbulb,
  Rocket,
  Share2,
  Users,
} from 'lucide-react';
import { HeroSection } from '@/components/ui/hero-section';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `About - ${siteConfig.name}`,
  description:
    'Learn about BetaVersion.IO — the developer identity platform that unifies your portfolio, resume, projects, and ideas under one subdomain.',
};

const values = [
  {
    icon: Code2,
    title: 'Developer-First',
    description:
      'Built by developers, for developers. Every feature is designed with the developer workflow in mind.',
  },
  {
    icon: Globe,
    title: 'Open & Connected',
    description:
      'Your identity lives under one subdomain — portfolio, resume, projects, and ideas, all unified.',
  },
  {
    icon: Lightbulb,
    title: 'Ship Ideas',
    description:
      'From concept to showcase. Share what you build, get feedback, and iterate in the open.',
  },
  {
    icon: Users,
    title: 'Community-Driven',
    description:
      'Discover fellow developers, collaborate on projects, and grow together as a community.',
  },
  {
    icon: Share2,
    title: 'Share Your Work',
    description:
      'Showcase your projects with rich media, tech stacks, and live demos — all in one place.',
  },
  {
    icon: Rocket,
    title: 'Launch Faster',
    description:
      'Stop juggling scattered profiles. One platform to present everything you do as a developer.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <HeroSection>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            About <span className="text-primary">{siteConfig.name}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            The developer identity platform. Portfolio, resume, projects, feed,
            and ideas — unified under one subdomain.
          </p>
        </div>
      </HeroSection>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Our Mission
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Developers deserve a single place that represents who they are and
            what they build. Too often, your work is scattered across GitHub
            repos, LinkedIn profiles, personal blogs, and portfolio sites that
            go stale. {siteConfig.name} brings it all together — a living,
            breathing developer identity that grows with you.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Whether you&apos;re a student shipping your first side project, an
            indie hacker launching a product, or a senior engineer sharing
            knowledge — this is your platform.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-t py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-center">
            What We Believe
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <value.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Got Questions?
          </h2>
          <p className="mt-4 text-muted-foreground">
            We&apos;d love to hear from you. Reach out at{' '}
            <a
              href={`mailto:${siteConfig.contact?.email}`}
              className="text-primary hover:underline"
            >
              {siteConfig.contact?.email}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
