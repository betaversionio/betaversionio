import React from 'react';
import { Terminal } from './terminal';
import { usePortfolio } from '../../lib/portfolio-context';

export function TerminalWithData({ addFolder, openApp }) {
    const { data } = usePortfolio();
    return <Terminal addFolder={addFolder} openApp={openApp} portfolioData={data} />;
}

export const displayTerminal = (addFolder, openApp) => {
    return <TerminalWithData addFolder={addFolder} openApp={openApp} />;
}
