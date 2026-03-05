import { Routes, Route } from 'react-router-dom';
import { PortfolioHome } from '@/pages/portfolio-home';
import { BlogDetail } from '@/pages/blog-detail';
import { ProjectDetail } from '@/pages/project-detail';
import { NotFound } from '@/pages/not-found';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioHome />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
