// Script to manually apply the bio column migration
// Run with: bun run packages/db/apply-bio-migration.ts

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables - check from packages/db directory
const envPaths = [
  resolve(process.cwd(), "apps/server/.env"),
  resolve(process.cwd(), ".env"),
  resolve(__dirname, "../../apps/server/.env"),
  resolve(__dirname, "../../.env"),
];

for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (process.env.DATABASE_URL) {
      console.log(`Loaded DATABASE_URL from: ${envPath}`);
      break;
    }
  } catch {
    // Continue to next path
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found. Checked paths:", envPaths);
  process.exit(1);
}

async function applyMigration() {
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    console.log("Applying bio column migration...");

    // Add the column if it doesn't exist
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text;`;

    console.log("✅ Migration applied successfully!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    await sql.end();
    process.exit(1);
  }
}

applyMigration();


