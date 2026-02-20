import { cn } from '@/lib/utils';
import type React from 'react';
import { DecorIcon } from '@/components/ui/decor-icon';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  CodeFolderIcon,
  File01Icon,
  RssIcon,
  Idea01Icon,
  GithubIcon,
} from '@hugeicons/core-free-icons';

type FeatureType = {
  title: string;
  icon: React.ReactNode;
  description: string;
};

export function FeatureSection() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-12 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h2 className="font-medium text-3xl tracking-tight md:text-5xl">
          Everything to build your developer presence
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
          Portfolio, resume, projects, feed, and collaboration tools — all under
          one subdomain.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard feature={feature} key={feature.title} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  feature: FeatureType;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between gap-6 bg-background px-6 pt-8 pb-6 shadow-sm',
        className,
      )}
      {...props}
    >
      {/* Dark mode radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            'radial-gradient(50% 80% at 25% 0%, hsl(var(--foreground) / 0.1), transparent)',
        }}
      />

      {/* Extended Borders */}
      <div className="absolute -inset-y-4 -left-px w-px bg-border" />
      <div className="absolute -inset-y-4 -right-px w-px bg-border" />
      <div className="absolute -inset-x-4 -top-px h-px bg-border" />
      <div className="absolute -right-4 -bottom-px -left-4 h-px bg-border" />

      {/* Corner Decor */}
      <DecorIcon className="size-3.5" position="top-left" />

      <div
        className={cn(
          'relative z-10 flex w-fit items-center justify-center rounded-lg border bg-muted/20 p-3',
          '[&_svg]:size-5 [&_svg]:stroke-[1.5] [&_svg]:text-foreground',
        )}
      >
        {feature.icon}
      </div>

      <div className="relative z-10 space-y-2">
        <h3 className="font-medium text-base text-foreground">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

const features: FeatureType[] = [
  {
    title: 'Developer Profile',
    icon: <HugeiconsIcon icon={UserIcon} />,
    description:
      'Your subdomain, your identity. Bio, tech stack, experience timeline, and social links — all on one public page.',
  },
  {
    title: 'Project Showcase',
    icon: <HugeiconsIcon icon={CodeFolderIcon} />,
    description:
      'Live demos, tech stacks, collaborators, and case studies. Way beyond a GitHub README.',
  },
  {
    title: 'Resume Builder',
    icon: <HugeiconsIcon icon={File01Icon} />,
    description:
      'Structured editor, ATS-friendly templates, and a live PDF always hosted at /resume.pdf.',
  },
  {
    title: 'Developer Feed',
    icon: <HugeiconsIcon icon={RssIcon} />,
    description:
      'Code snippets, TILs, project updates, and milestones. A feed built for builders, not buzzwords.',
  },
  {
    title: 'Idea Board',
    icon: <HugeiconsIcon icon={Idea01Icon} />,
    description:
      'Pitch ideas, find collaborators, vote on concepts, and convert ideas into real team projects.',
  },
  {
    title: 'GitHub Integration',
    icon: <HugeiconsIcon icon={GithubIcon} />,
    description:
      'One-click sign-in. Auto-import repos, languages, and contribution data to fill your profile.',
  },
];
