import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  // Enable Cache Components (Next.js 16.0.6+)
  cacheComponents: true,
  // Transpile workspace packages that contain TypeScript
  transpilePackages: ["@benkyou/fsrs"],
  // Configure allowed external image domains for deck covers
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com", // Twitter images
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash images
      },
      {
        protocol: "https",
        hostname: "i.imgur.com", // Imgur images
      },
    ],
  },
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
      {
        // Proxy all /api/user/* requests to the Elysia server
        source: "/api/user/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/user/:path*`,
      },
      {
        // Proxy all /api/admin/* requests to the Elysia server
        source: "/api/admin/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/admin/:path*`,
      },
      {
        // Proxy all /api/note-types/* requests to the Elysia server
        source: "/api/note-types/:path*",
        destination: `${process.env.SERVER_URL || "http://localhost:3000"}/api/note-types/:path*`,
      },
    ];
  },
};

export default nextConfig;
