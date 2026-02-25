import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title?: string;
  highlightedText?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroSection({
  title,
  highlightedText,
  description,
  children,
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b py-20 md:py-28',
        className,
      )}
    >
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

      <div className="relative z-10">
        {title && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              {title}{' '}
              {highlightedText && (
                <span className="text-primary">{highlightedText}</span>
              )}
            </h1>
            {description && (
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
