import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from multiple possible locations
// Drizzle config runs from packages/db, so we need to check various paths
const envPaths = [
  "../../apps/server/.env", // apps/server/.env (your current location)
  "../../.env", // Root directory
  "../../../.env", // One more level up
  ".env", // Current directory
];

// Try to load from each location
for (const envPath of envPaths) {
  const fullPath = resolve(envPath);
  try {
    const result = dotenv.config({ path: fullPath });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      // Found a .env file with content
      break;
    }
  } catch {
    // Continue to next path
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Please set it in your .env file. " +
      "Checked locations: apps/server/.env, root .env, packages/db/.env"
  );
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
