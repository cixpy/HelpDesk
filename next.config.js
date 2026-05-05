/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel runs on Node.js — these packages use native bindings
  // and must be excluded from the Edge/client bundle
  serverExternalPackages: ['bcryptjs', '@prisma/client', 'prisma'],

  // Suppress the Prisma binary warning during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

module.exports = nextConfig;
