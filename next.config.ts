import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/memories/new",
        destination: "/memory/new",
        permanent: false,
      },
      {
        source: "/memories/:id",
        destination: "/memory/:id",
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
