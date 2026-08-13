import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image optimization — allow Supabase storage URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Serve WebP/AVIF for smaller files on mobile
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
