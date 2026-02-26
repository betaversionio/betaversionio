'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import {
  FeatureSection,
  TestimonialsSection,
  FaqsSection,
} from '@/features/home';
import { Logo } from '@/components/shared/logo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  CodeFolderIcon,
  File01Icon,
  RssIcon,
  Idea01Icon,
  ArrowRight01Icon,
  DashboardSquare01Icon,
  Settings01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

/* ─── animation helpers ─── */

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

/* ─── dashboard preview ─── */

function DashboardPreview() {
  return (
    <div className="group relative">
      <div className="absolute -inset-4 rounded-2xl bg-foreground/[0.03] blur-2xl transition-all duration-700 group-hover:bg-foreground/[0.06]" />

      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-foreground/5 dark:shadow-foreground/[0.02]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
          </div>
          <div className="ml-2 flex h-6 flex-1 items-center rounded-md bg-background/60 px-3">
            <span className="font-mono text-[11px] text-muted-foreground/70">
              satyam.betaversion.io
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex h-[320px] sm:h-[360px]">
          {/* Sidebar */}
          <div className="hidden w-44 flex-shrink-0 border-r border-border/30 bg-muted/10 p-3 sm:block">
            <div className="mb-5 flex items-center gap-2 px-1.5">
              <Logo className="h-4 w-4 text-foreground" />
              <span className="text-[11px] font-semibold">BetaVersion.IO</span>
            </div>
            <div className="space-y-0.5">
              {[
                {
                  icon: DashboardSquare01Icon,
                  label: 'Dashboard',
                  active: true,
                },
                { icon: UserIcon, label: 'Profile' },
                { icon: CodeFolderIcon, label: 'Projects' },
                { icon: File01Icon, label: 'Resume' },
                { icon: RssIcon, label: 'Feed' },
                { icon: Idea01Icon, label: 'Ideas' },
                { icon: Settings01Icon, label: 'Settings' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                    'active' in item && item.active
                      ? 'bg-foreground/[0.06] font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <HugeiconsIcon icon={item.icon} size={12} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/5" />
              <div>
                <div className="text-[13px] font-semibold">Satyam Verma</div>
                <div className="text-[10px] text-muted-foreground">
                  Full Stack Developer
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-1">
              {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Next.js'].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[9px] font-medium text-foreground/70"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>

            <div className="mb-2 text-[10px] font-medium text-muted-foreground">
              Projects
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { n: 'BetaVersion.IO', d: 'Developer identity' },
                { n: 'CodeSync', d: 'Real-time collab' },
                { n: 'ResumeKit', d: 'PDF generator' },
              ].map((p) => (
                <div
                  key={p.n}
                  className="rounded-lg border border-border/30 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="text-[11px] font-semibold">{p.n}</div>
                  <div className="mt-0.5 text-[9px] text-muted-foreground">
                    {p.d}
                  </div>
                  <div className="mt-1.5 flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <HugeiconsIcon icon={StarIcon} size={9} />
                    {p.n === 'BetaVersion.IO'
                      ? 64
                      : p.n === 'CodeSync'
                        ? 42
                        : 31}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── page ─── */

export default function LandingPage() {
  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen w-full overflow-hidden bg-background">
        {/* Radial spotlight */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--foreground)/0.06),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--foreground)/0.1),transparent_55%)]" />
        </div>

        {/* Grid background with mask */}
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem',
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-1.5 text-sm text-muted-foreground shadow-lg backdrop-blur dark:bg-background/40">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              The Developer Identity Platform
            </div>
          </motion.div>

          {/* Heading with text flip */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Where developers are
            <br />
            <span className="mt-2 inline-flex items-center gap-3">
              known for{' '}
              <ContainerTextFlip
                words={['building', 'shipping', 'creating', 'crafting']}
                interval={2500}
                textClassName="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
                animationDuration={500}
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-2xl text-center text-lg text-muted-foreground md:text-xl"
          >
            Portfolio, resume, projects, feed, and ideas — unified under your
            own subdomain. One URL, your entire professional identity.
          </motion.p>

          {/* Domain pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 inline-flex items-center rounded-lg border border-border/40 bg-muted/20 px-5 py-2.5 font-mono text-sm backdrop-blur-sm"
          >
            <span className="text-muted-foreground/60">yourname</span>
            <span className="font-medium text-foreground">.betaversion.io</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="h-12 gap-2 rounded-lg bg-foreground px-8 text-sm font-medium text-background shadow-2xl transition-all hover:-translate-y-[1px] hover:bg-foreground/90"
              asChild
            >
              <Link href="/register">
                Get Started
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-lg border-border/60 px-8 text-sm font-medium transition-all hover:bg-muted/50"
              asChild
            >
              <Link href="/explore">Explore Developers</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              { value: '10K+', label: 'Developers' },
              { value: '25K+', label: 'Projects' },
              { value: '50K+', label: 'Resumes built' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-3xl font-bold text-primary">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ DASHBOARD PREVIEW ═══ */}
      <section className="border-t border-border/40 bg-muted/10 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <div className="border-t border-border/40">
        <FeatureSection />
      </div>

      {/* ═══ WHY betaversionio ═══ */}
      <section className="border-t border-border/40 bg-muted/10 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            className="mx-auto mb-16 max-w-lg text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p
              variants={fadeUp}
              className="mb-3 text-[13px] font-medium uppercase tracking-widest text-muted-foreground"
            >
              Why BetaVersion.IO
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Replace the scattered mess
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-muted-foreground">
              Stop maintaining five different profiles across five different
              platforms. BetaVersion.IO is one source of truth for your
              developer identity.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              'Your own subdomain — yourname.betaversion.io',
              'Always-live resume PDF that auto-updates',
              'Proof-of-work portfolio, not buzzword bingo',
              'Developer-only feed — no recruiter spam',
              'Find collaborators through the Idea Board',
              'GitHub import fills your profile in minutes',
            ].map((point) => (
              <motion.div
                key={point}
                variants={cardUp}
                className="group flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4 transition-colors hover:border-border/80 hover:bg-muted/30"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={18}
                  className="mt-0.5 shrink-0 text-foreground/50 transition-colors group-hover:text-foreground"
                />
                <span className="text-[14px] leading-relaxed">{point}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="border-t border-border/40 py-24 md:py-32">
        <div className="mx-auto mb-12 max-w-md px-4 text-center">
          <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
            Testimonials
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by developers
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Hear from developers who replaced their fragmented online presence
            with a single BetaVersion.IO profile.
          </p>
        </div>
        <TestimonialsSection />
      </section>

      {/* ═══ FAQ ═══ */}
      <div className="border-t border-border/40 py-20 md:py-28">
        <FaqsSection />
      </div>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden border-t border-border/40">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground) / 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground) / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '3rem 3rem',
          }}
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.03] blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center md:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-3 text-sm font-medium text-muted-foreground"
          >
            Ready?
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Ship your identity.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-sm text-muted-foreground"
          >
            Your code speaks. Let your profile do the same. Join thousands of
            developers building their presence on BetaVersion.IO.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex gap-3">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-lg bg-foreground px-8 text-sm font-medium text-background shadow-2xl transition-all hover:-translate-y-[1px] hover:bg-foreground/90"
              asChild
            >
              <Link href="/register">
                Create Your Profile
                <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
