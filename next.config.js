/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
  },
  allowedDevOrigins: ['192.168.137.1', 'localhost:3000', 'localhost:3001', 'localhost:3002']
}

module.exports = nextConfig
