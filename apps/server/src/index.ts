import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@benkyou/auth";

// Get Next.js origin for proxy requests
const nextJsOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const serverOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";

const app = new Elysia()
  .use(
    cors({
      // Allow requests from Next.js (proxy) and direct connections
      origin: [nextJsOrigin, serverOrigin].filter(Boolean),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    // Handle all HTTP methods that Better Auth might use
    if (["POST", "GET", "PUT", "DELETE", "PATCH"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .get("/", () => "Hello Elysia")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    console.log(
      `CORS enabled for: ${[nextJsOrigin, serverOrigin].filter(Boolean).join(", ")}`,
    );
  });
