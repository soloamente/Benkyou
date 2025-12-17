// Script to add display settings columns to the deck table
// Run with: bun run packages/db/migrate-deck-settings.ts

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
    console.log("Applying deck settings migration...");

    // Step 1: Add note_type_id column (nullable, references note_type)
    console.log("Adding note_type_id column to deck table...");
    await sql`
      ALTER TABLE "deck" 
      ADD COLUMN IF NOT EXISTS "note_type_id" text 
      REFERENCES "note_type"("id") ON DELETE SET NULL;
    `;
    console.log("✅ Added note_type_id column");

    // Step 2: Add display_settings jsonb column
    console.log("Adding display_settings column to deck table...");
    await sql`
      ALTER TABLE "deck" 
      ADD COLUMN IF NOT EXISTS "display_settings" jsonb;
    `;
    console.log("✅ Added display_settings column");

    // Step 3: Create index on note_type_id for faster lookups
    console.log("Creating index on note_type_id...");
    await sql`
      CREATE INDEX IF NOT EXISTS "deck_noteTypeId_idx" ON "deck" ("note_type_id");
    `;
    console.log("✅ Created index on note_type_id");

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


