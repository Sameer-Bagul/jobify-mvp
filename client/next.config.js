/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
};

module.exports = nextConfig;
