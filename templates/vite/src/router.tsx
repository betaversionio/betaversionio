import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { BlogDetail } from './pages/BlogDetail';
import { ProjectDetail } from './pages/ProjectDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: null },
      { path: 'resume', element: null },
      { path: 'portfolio', element: null },
      { path: 'blog', element: null },
    ],
  },
  {
    path: '/blog/:slug',
    element: <BlogDetail />,
  },
  {
    path: '/project/:slug',
    element: <ProjectDetail />,
  },
]);
