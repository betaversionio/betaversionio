import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@betaversionio/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.betaversion.io' },
    ],
  },
};

export default nextConfig;
