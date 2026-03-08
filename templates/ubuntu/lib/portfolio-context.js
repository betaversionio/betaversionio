import React, { createContext, useContext, useEffect, useState } from 'react';
import { BetaVersionClient } from '@betaversionio/portfolio-sdk';

const PortfolioContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const USERNAME = process.env.NEXT_PUBLIC_PORTFOLIO_USERNAME || undefined;

const client = new BetaVersionClient({ apiUrl: API_URL });

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .getPortfolio(USERNAME)
      .then((result) => {
        if (result) setData(result);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortfolioContext.Provider value={{ data, loading }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
