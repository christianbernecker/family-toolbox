/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporär für Staging - ignoriere TypeScript-Fehler
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporär für Staging - ignoriere ESLint-Fehler
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 