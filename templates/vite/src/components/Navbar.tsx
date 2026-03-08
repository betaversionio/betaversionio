import { Link } from 'react-router-dom';

const PAGE_PATHS: Record<string, string> = {
  about: '/',
  resume: '/resume',
  portfolio: '/portfolio',
  blog: '/blog',
};

interface NavbarProps {
  activePage: string;
  pages: readonly string[];
}

export function Navbar({ activePage, pages }: NavbarProps) {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        {pages.map((page) => (
          <li key={page} className="navbar-item">
            <Link
              to={PAGE_PATHS[page] ?? '/'}
              className={`navbar-link ${activePage === page ? 'active' : ''}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
