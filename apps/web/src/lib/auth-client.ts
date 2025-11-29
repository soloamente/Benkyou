import type { auth } from "@benkyou/auth";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { usernameClient } from "better-auth/client/plugins";

// Use Next.js app URL for proxy - requests will be proxied to Elysia server via Next.js rewrites
// In browser, use window.location.origin; fallback to env var for SSR
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  // For SSR, use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth`
    : "http://localhost:3001/api/auth";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(), // Proxy will handle forwarding to Elysia server
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(), // Add username client plugin
  ],
});
