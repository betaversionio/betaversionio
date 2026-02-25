import { Markdown } from '@/components/ui/markdown';
import { HeroSection } from '@/components/ui/hero-section';
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
      <HeroSection
        title={title}
        highlightedText={highlightedText}
        description={description}
      />

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
