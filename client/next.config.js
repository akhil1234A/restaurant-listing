const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  mode: 'production',
  swSrc: 'public/service-worker.js', // Custom service worker
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['eduoxy.s3.ap-south-1.amazonaws.com'],
  },
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);