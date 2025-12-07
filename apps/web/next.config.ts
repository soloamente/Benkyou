import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  // Transpile workspace packages that contain TypeScript
  transpilePackages: ["@benkyou/fsrs"],
  async rewrites() {
    return [
      {
        // Proxy all /api/auth/* requests to the Elysia server
        source: "/api/auth/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/auth/:path*`,
      },
      {
        // Proxy all /api/decks/* requests to the Elysia server
        source: "/api/decks/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/decks/:path*`,
      },
      {
        // Proxy all /api/cards/* requests to the Elysia server
        source: "/api/cards/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/cards/:path*`,
      },
      {
        // Proxy all /api/study/* requests to the Elysia server
        source: "/api/study/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/study/:path*`,
      },
    ];
  },
};

export default nextConfig;
