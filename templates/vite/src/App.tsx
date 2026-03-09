import { useLocation } from 'react-router-dom';
import { usePortfolio } from '@betaversionio/portfolio-sdk/hooks';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { About } from './components/About';
import { Resume } from './components/Resume';
import { Portfolio } from './components/Portfolio';
import { Blog } from './components/Blog';

const PAGES = ['about', 'resume', 'portfolio', 'blog'] as const;
type Page = (typeof PAGES)[number];

const PATH_TO_PAGE: Record<string, Page> = {
  '/': 'about',
  '/resume': 'resume',
  '/portfolio': 'portfolio',
  '/blog': 'blog',
};

export function App() {
  const { data, isPending, isError, error } = usePortfolio();
  const location = useLocation();
  const activePage = PATH_TO_PAGE[location.pathname] ?? 'about';

  if (isPending) {
    return (
      <main>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--light-gray)' }}>
          Loading portfolio...
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--bittersweet-shimmer)' }}>
          {error?.message ?? 'Portfolio not found'}
        </div>
      </main>
    );
  }

  const { user, projects, blogs, followCounts } = data;

  return (
    <main>
      <Sidebar user={user} followCounts={followCounts} />

      <div className="main-content">
        <Navbar activePage={activePage} pages={PAGES} />

        <About user={user} active={activePage === 'about'} />
        <Resume user={user} active={activePage === 'resume'} />
        <Portfolio projects={projects} active={activePage === 'portfolio'} />
        <Blog blogs={blogs} active={activePage === 'blog'} />
      </div>
    </main>
  );
}
