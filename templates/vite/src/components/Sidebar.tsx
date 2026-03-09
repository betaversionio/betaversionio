import { useState } from 'react';
import type { PortfolioUser, FollowCounts } from '@betaversionio/portfolio-sdk';

const PLATFORM_ICONS: Record<string, string> = {
  github: 'logo-github',
  linkedin: 'logo-linkedin',
  twitter: 'logo-twitter',
  facebook: 'logo-facebook',
  instagram: 'logo-instagram',
  youtube: 'logo-youtube',
  dribbble: 'logo-dribbble',
  behance: 'logo-behance',
  website: 'globe-outline',
  devto: 'logo-web-component',
};

interface SidebarProps {
  user: PortfolioUser;
  followCounts: FollowCounts;
}

export function Sidebar({ user, followCounts }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className={`sidebar ${expanded ? 'active' : ''}`} data-sidebar>
      <div className="sidebar-info">
        <figure className="avatar-box">
          <img
            src={user.avatarUrl ?? ''}
            alt={user.name ?? user.username}
            width="80"
          />
        </figure>

        <div className="info-content">
          <h1 className="name" title={user.name ?? user.username}>
            {user.name ?? user.username}
          </h1>
          <p className="title">{user.profile?.headline ?? 'Developer'}</p>
        </div>

        <button
          className="info_more-btn"
          onClick={() => setExpanded((p) => !p)}
        >
          <span>{expanded ? 'Hide Contacts' : 'Show Contacts'}</span>
          <ion-icon name="chevron-down"></ion-icon>
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="mail-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href={`mailto:${user.email}`} className="contact-link">
                {user.email}
              </a>
            </div>
          </li>

          {user.profile?.location && (
            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="location-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Location</p>
                <address>{user.profile.location}</address>
              </div>
            </li>
          )}

          {user.profile?.website && (
            <li className="contact-item">
              <div className="icon-box">
                <ion-icon name="globe-outline"></ion-icon>
              </div>
              <div className="contact-info">
                <p className="contact-title">Website</p>
                <a
                  href={user.profile.website}
                  className="contact-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </li>
          )}

          <li className="contact-item">
            <div className="icon-box">
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <div className="contact-info">
              <p className="contact-title">Followers</p>
              <span style={{ color: 'var(--white-2)', fontSize: 'var(--fs-7)' }}>
                {followCounts.followersCount} followers &middot;{' '}
                {followCounts.followingCount} following
              </span>
            </div>
          </li>
        </ul>

        {user.socialLinks.length > 0 && (
          <>
            <div className="separator"></div>
            <ul className="social-list">
              {user.socialLinks.map((link) => (
                <li key={link.platform} className="social-item">
                  <a
                    href={link.url}
                    className="social-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ion-icon
                      name={PLATFORM_ICONS[link.platform.toLowerCase()] ?? 'link-outline'}
                    ></ion-icon>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
