import React from 'react'
import { usePortfolio } from '../../lib/portfolio-context';

export default function VsCode() {
    const { data } = usePortfolio();

    // Try to find a GitHub social link to build the GitHub1s URL
    const githubLink = data?.user?.socialLinks?.find(
        (link) => link.platform.toLowerCase() === 'github'
    );

    let iframeSrc = "https://github1s.com";
    if (githubLink) {
        // Extract username from GitHub URL (e.g., https://github.com/username)
        const match = githubLink.url.match(/github\.com\/([^/]+)/);
        if (match) {
            iframeSrc = `https://github1s.com/${match[1]}`;
        }
    }

    return (
        <iframe src={iframeSrc} frameBorder="0" title="VsCode" className="h-full w-full bg-ub-cool-grey"></iframe>
    )
}

export const displayVsCode = () => {
    return <VsCode />;
}
