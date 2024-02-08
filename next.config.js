/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'books.google.com',
        protocol: 'https',
      },
      {
        hostname: 'picsum.photos',
        protocol: 'https',
      },
    ],
  },
};

module.exports = nextConfig;
