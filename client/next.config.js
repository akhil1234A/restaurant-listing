const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable PWA in dev to avoid caching issues
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^\/_next\/.*/, // Cache Next.js assets
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^\/api\/.*/, // Cache API responses
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, // Cache images
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /.*/, // Fallback for HTML pages
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [200],
        },
        fallbacks: {
          document: '/offline', // Show offline page when network fails
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['eduoxy.s3.ap-south-1.amazonaws.com'],
  },
};

module.exports = withPWA(nextConfig);
