import { SocialIcon } from 'react-social-icons';

interface PortfolioFooterProps {
  name: string;
  socialLinks: Array<{ platform: string; url: string }>;
}

export function PortfolioFooter({ name, socialLinks }: PortfolioFooterProps) {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {name}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1">
              {socialLinks.map((link) => (
                <span
                  key={link.platform}
                  className="rounded-full transition-colors hover:bg-muted"
                >
                  <SocialIcon
                    url={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    bgColor="transparent"
                    fgColor="hsl(var(--foreground))"
                    title={link.platform}
                    style={{ height: 32, width: 32 }}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
