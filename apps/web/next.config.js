/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hookcraft/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
