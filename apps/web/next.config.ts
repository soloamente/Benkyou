import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        // Proxy all /api/auth/* requests to the Elysia server
        source: "/api/auth/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
