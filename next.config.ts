import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  transpilePackages: ["three"],
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
  },
  redirects() {
    return Promise.resolve([
      {
        source: "/",
        destination: "/th",
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
