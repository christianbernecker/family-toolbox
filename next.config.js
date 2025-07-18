/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
  typescript: {
    // Temporär für Staging - ignoriere TypeScript-Fehler
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporär für Staging - ignoriere ESLint-Fehler
    ignoreDuringBuilds: true,
  },
  serverRuntimeConfig: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  }
};

module.exports = nextConfig; 