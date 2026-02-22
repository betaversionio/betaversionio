import { Markdown } from '@/components/ui/markdown';
import { siteConfig } from '@/config/site';

interface LegalPageProps {
  title: string;
  highlightedText: string;
  description: string;
  lastUpdated: string;
  content: string;
  contactEmail?: string;
  contactLabel?: string;
}

export function LegalPage({
  title,
  highlightedText,
  description,
  lastUpdated,
  content,
  contactEmail = siteConfig.contact?.email || 'legal@betaversion.io',
  contactLabel = 'Questions?',
}: LegalPageProps) {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b py-20 md:py-28">
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

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {title} <span className="text-primary">{highlightedText}</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>

          <Markdown content={content} />

          <div className="mt-12 rounded-lg border p-6">
            <h3 className="font-semibold">{contactLabel}</h3>
            <p className="mt-2 text-muted-foreground">
              If you have any questions, please contact us at{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="text-primary hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
