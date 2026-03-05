import type { PortfolioUser, PortfolioResume, FollowCounts } from '@/lib/api';

const platformLabels: Record<string, string> = {
  Github: 'GitHub',
  Linkedin: 'LinkedIn',
  Twitter: 'Twitter / X',
  Website: 'Website',
  Devto: 'Dev.to',
  Youtube: 'YouTube',
  Dribbble: 'Dribbble',
  Behance: 'Behance',
};

interface SidebarProps {
  user: PortfolioUser;
  resume: PortfolioResume | null;
  followCounts: FollowCounts;
}

export function Sidebar({ user, resume, followCounts }: SidebarProps) {
  const displayName = user.name ?? user.username;
  const headline = user.profile?.headline;
  const location = user.profile?.location;
  const website = user.profile?.website;

  return (
    <aside className="w-full shrink-0 lg:w-[280px]">
      <div className="sticky top-8 space-y-6 rounded-xl border border-border bg-card p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-2 ring-border">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="mt-4 text-xl font-bold">{displayName}</h1>
          {headline && (
            <p className="mt-1 text-sm text-muted-foreground">{headline}</p>
          )}
        </div>

        {/* Follow counts */}
        {(followCounts.followersCount > 0 || followCounts.followingCount > 0) && (
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold">{followCounts.followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{followCounts.followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        )}

        {/* Location & Website */}
        {(location || website) && (
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            {location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate transition-colors hover:text-foreground"
                >
                  {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Social links */}
        {user.socialLinks.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Socials
            </p>
            <div className="flex flex-wrap gap-2">
              {user.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {platformLabels[link.platform] ?? link.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resume download */}
        {resume?.pdfUrl && (
          <div className="border-t border-border pt-4">
            <a
              href={resume.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>
        )}

        {/* Tech stack */}
        {user.techStack.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
