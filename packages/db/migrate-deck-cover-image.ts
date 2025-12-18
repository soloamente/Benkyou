// Script to add cover_image column to the deck table
// Run with: bun run packages/db/migrate-deck-cover-image.ts

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
    config({ path: envPath });
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
    console.log("Applying deck cover image migration...");

    // Add cover_image column (nullable text for storing image URLs)
    console.log("Adding cover_image column to deck table...");
    await sql`
      ALTER TABLE "deck" 
      ADD COLUMN IF NOT EXISTS "cover_image" text;
    `;
    console.log("✅ Added cover_image column");

    console.log("\n🎉 Migration completed successfully!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    await sql.end();
    process.exit(1);
  }
}

applyMigration();
