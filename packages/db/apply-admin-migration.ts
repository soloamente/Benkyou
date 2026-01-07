// Script to manually apply the admin plugin migration
// Run with: bun run packages/db/apply-admin-migration.ts
//
// This migration adds:
// - Admin fields to user table: role, banned, banReason, banExpires
// - impersonatedBy field to session table
// - waitlist table

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
    console.log("Starting admin plugin migration...\n");

    // Add admin fields to user table
    console.log("Adding admin fields to user table...");
    await sql`
      DO $$ 
      BEGIN
        -- Add role column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'role'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "role" text;
        END IF;

        -- Add banned column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'banned'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;
        END IF;

        -- Add ban_reason column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'ban_reason'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "ban_reason" text;
        END IF;

        -- Add ban_expires column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user' AND column_name = 'ban_expires'
        ) THEN
          ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;
        END IF;
      END $$;
    `;
    console.log("✓ Admin fields added to user table\n");

    // Add impersonatedBy field to session table
    console.log("Adding impersonatedBy field to session table...");
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'session' AND column_name = 'impersonated_by'
        ) THEN
          ALTER TABLE "session" ADD COLUMN "impersonated_by" text;
        END IF;
      END $$;
    `;
    console.log("✓ impersonatedBy field added to session table\n");

    // Create waitlist table
    console.log("Creating waitlist table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "waitlist" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "name" text,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✓ Waitlist table created\n");

    // Create indexes for waitlist table
    console.log("Creating waitlist indexes...");
    await sql`
      DO $$ 
      BEGIN
        -- Create email index if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'waitlist' AND indexname = 'waitlist_email_idx'
        ) THEN
          CREATE INDEX "waitlist_email_idx" ON "waitlist" USING btree ("email");
        END IF;

        -- Create status index if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'waitlist' AND indexname = 'waitlist_status_idx'
        ) THEN
          CREATE INDEX "waitlist_status_idx" ON "waitlist" USING btree ("status");
        END IF;
      END $$;
    `;
    console.log("✓ Waitlist indexes created\n");

    console.log("✅ Migration completed successfully!");
    console.log("\nSummary:");
    console.log("  - Added admin fields to user table (role, banned, banReason, banExpires)");
    console.log("  - Added impersonatedBy field to session table");
    console.log("  - Created waitlist table with indexes");
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    await sql.end();
    process.exit(1);
  }
}

applyMigration();
