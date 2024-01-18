/** @type {import('next').NextConfig} */
const nextConfig = {
  compilerOptions: {
    baseUrl: ".",
    paths: {
      "@/app/*": ["app/*"],
      "@/components/*": ["components/*"],
      "@/types/*": ["types/*"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
      },
    ],
  },
};

module.exports = nextConfig;
