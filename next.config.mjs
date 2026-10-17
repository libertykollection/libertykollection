import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'data.tascpa.ca',
      },
      {
        protocol: 'https',
        hostname: 'rapidtechpro.com',
      },
      {
        protocol: 'https',
        hostname: 'files.store2u.ca',
      },
      {
        protocol: 'https',
        hostname: 'store2u.ca',
      },
      {
        protocol: 'https',
        hostname: '*.store2u.ca',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Increase timeout for external images
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,

  // Production optimizations
  // Disabled optimizeCss as it requires 'critters' package and can cause build issues
  // experimental: {
  //   optimizeCss: true,
  // },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
        ],
      },

    ];
  },

  // Fix workspace root detection for Turbopack in Next.js 16
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
