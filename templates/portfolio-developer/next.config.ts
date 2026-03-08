import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    transpilePackages: ['@betaversionio/portfolio-sdk'],
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
};

export default nextConfig;
