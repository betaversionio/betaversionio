import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { PortfolioProvider } from '@betaversionio/portfolio-sdk/hooks';
import { router } from './router';
import './style.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
const USERNAME = import.meta.env.VITE_PORTFOLIO_USERNAME as string | undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioProvider apiUrl={API_URL} fallbackUsername={USERNAME}>
      <RouterProvider router={router} />
    </PortfolioProvider>
  </StrictMode>,
);
