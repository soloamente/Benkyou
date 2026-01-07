// Script to mark the generated migration as applied in the database
// This is needed when migrations are applied manually instead of via drizzle-kit migrate
// Run with: bun run packages/db/mark-migration-applied.ts

import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";
import { readFileSync } from "fs";

// Load environment variables
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

async function markMigrationApplied() {
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    console.log("Marking migration as applied...");

    // Read the migration file to get its hash
    const migrationFile = resolve(__dirname, "drizzle/0000_common_dark_phoenix.sql");
    const migrationContent = readFileSync(migrationFile, "utf-8");
    
    // Calculate a simple hash (Drizzle uses a hash to verify migrations)
    // For now, we'll use the migration tag from the journal
    const migrationTag = "0000_common_dark_phoenix";
    
    // Check the structure of the migrations table
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `;
    
    console.log("Migrations table structure:", tableInfo);

    // Check if migration is already marked as applied
    // Drizzle uses 'id' as the primary key, not 'hash'
    const existing = await sql`
      SELECT * FROM drizzle.__drizzle_migrations 
      LIMIT 5
    `;
    
    console.log("Existing migrations:", existing);

    // Drizzle migrations table structure:
    // - id (serial/primary key)
    // - hash (text) - the migration hash/tag
    // - created_at (bigint) - timestamp in milliseconds
    
    // Check if this migration already exists
    const migrationExists = await sql`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = ${migrationTag}
    `;

    if (migrationExists.length > 0) {
      console.log("✅ Migration is already marked as applied!");
      await sql.end();
      process.exit(0);
    }

    // Insert migration record
    // Drizzle uses bigint for created_at (milliseconds since epoch)
    const createdAt = BigInt(Date.now());
    
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${migrationTag}, ${createdAt})
    `;

    console.log("✅ Migration marked as applied successfully!");
    console.log("\nNote: This migration was applied manually via apply-admin-migration.ts");
    console.log("The migration file contains CREATE TABLE statements for existing tables,");
    console.log("so we're marking it as applied to prevent errors.");
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error marking migration as applied:", error);
    await sql.end();
    process.exit(1);
  }
}

markMigrationApplied();
