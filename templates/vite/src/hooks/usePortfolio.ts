import { useEffect, useState } from 'react';
import { fetchPortfolio, type PortfolioData } from '../lib/api';

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio()
      .then((result) => {
        if (result) {
          setData(result);
        } else {
          setError('Portfolio not found');
        }
      })
      .catch(() => setError('Failed to load portfolio'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
