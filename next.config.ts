import type { NextConfig } from "next";

// Parse the R2 public URL at config time to add the hostname to Next.js Image
// allowed origins. Falls back gracefully if the env var is not set yet.
const r2PublicHostname = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    return raw ? new URL(raw).hostname : null
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      ...(r2PublicHostname
        ? [{ protocol: "https" as const, hostname: r2PublicHostname, pathname: "/**" }]
        : []),
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
