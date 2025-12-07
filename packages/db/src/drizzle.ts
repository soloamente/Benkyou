import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import { resolve } from "path";

// Load environment variables from multiple possible locations
// This allows the CLI to work even if .env is in different locations
// Paths are resolved relative to the current working directory (workspace root when running from root)
const envPaths = [
  resolve(process.cwd(), ".env"), // Root directory (current working directory)
  resolve(process.cwd(), "apps/server/.env"), // Server directory
];

// Try to load from each location (first one that exists wins)
// Only load if DATABASE_URL is not already set (allows dotenv/config from index.ts to work)
if (!process.env.DATABASE_URL) {
  for (const envPath of envPaths) {
    try {
      dotenv.config({ path: envPath });
      if (process.env.DATABASE_URL) break;
    } catch {
      // Continue to next path
    }
  }
}

// Lazy initialization - only create connection when actually needed
// This allows the Better Auth CLI to read the config without requiring DATABASE_URL
let _client: postgres.Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getClient(): postgres.Sql {
  if (!_client) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is required. " +
          "Please set it in your .env file (root directory or apps/server/.env)",
      );
    }

    // Create the postgres client
    // For Supabase, you can use connection pooling
    // Use the connection string from Supabase dashboard: Settings > Database > Connection string (URI mode)
    _client = postgres(connectionString, {
      max: 10, // Maximum number of connections in the pool
      idle_timeout: 20, // Close idle clients after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
  }
  return _client;
}

function getDb(): ReturnType<typeof drizzle> {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Create a lazy getter for the db instance
// This allows the module to be imported without immediately connecting to the database
// The connection is only created when db methods are actually called
const dbProxy = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const dbInstance = getDb();
    const value = dbInstance[prop as keyof ReturnType<typeof drizzle>];
    // If it's a function, bind it to the db instance
    if (typeof value === "function") {
      return value.bind(dbInstance);
    }
    return value;
  },
});

export const db = dbProxy;

// Export client getter for advanced use cases
export function getClientInstance(): postgres.Sql {
  return getClient();
}
