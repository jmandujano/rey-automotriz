/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Experimental settings.  The `appDir` flag was removed in Next.js 14 as the
   * App Router is enabled by default.  We still specify
   * `serverComponentsExternalPackages` to allow Prisma Client to be bundled
   * properly.  See: https://nextjs.org/docs/messages/invalid-next-config
   */
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;