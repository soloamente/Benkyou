// Migration script to add note_type and note tables, and migrate existing cards
// This script:
// 1. Creates note_type and note tables
// 2. Adds note_id column to card table (nullable for backward compatibility)
// 3. Seeds default "Basic" note type for all existing users
// 4. Migrates existing cards to notes (creates notes from existing cards)
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from multiple possible locations
// Since we might run from packages/db, we need to go up to find .env files
const envPaths = [
  resolve(process.cwd(), ".env"), // Current directory
  resolve(process.cwd(), "../.env"), // Parent directory (workspace root)
  resolve(process.cwd(), "../../.env"), // Two levels up (workspace root from packages/db)
  resolve(process.cwd(), "../../apps/server/.env"), // Server .env from packages/db
];

// Try to load from each location
if (!process.env.DATABASE_URL) {
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
}

import { getClientInstance } from "./src/drizzle";

async function migrateToNotes() {
  // Verify DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required.");
    console.error("\nPlease set DATABASE_URL in one of these locations:");
    console.error("  - .env (in packages/db directory)");
    console.error("  - .env (in workspace root)");
    console.error("  - apps/server/.env");
    console.error("\nTried paths:");
    envPaths.forEach((path) => console.error(`  - ${path}`));
    process.exit(1);
  }

  const client = getClientInstance();

  try {
    console.log("Starting migration to notes system...\n");

    // Step 1: Create note_type table
    console.log("Step 1: Creating note_type table...");
    await client`
      CREATE TABLE IF NOT EXISTS "note_type" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "user_id" text NOT NULL,
        "fields" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created note_type table");

    // Create index for note_type
    await client`
      CREATE INDEX IF NOT EXISTS "note_type_userId_idx" ON "note_type" ("user_id");
    `;
    console.log("✅ Created note_type_userId_idx index");

    // Create foreign key for note_type
    try {
      await client`
        ALTER TABLE "note_type" 
        ADD CONSTRAINT "note_type_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created note_type foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Note type foreign key already exists");
      } else {
        throw error;
      }
    }

    // Step 2: Create note table
    console.log("\nStep 2: Creating note table...");
    await client`
      CREATE TABLE IF NOT EXISTS "note" (
        "id" text PRIMARY KEY NOT NULL,
        "deck_id" text NOT NULL,
        "note_type_id" text NOT NULL,
        "fields" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created note table");

    // Create indexes for note
    await client`
      CREATE INDEX IF NOT EXISTS "note_deckId_idx" ON "note" ("deck_id");
    `;
    console.log("✅ Created note_deckId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "note_noteTypeId_idx" ON "note" ("note_type_id");
    `;
    console.log("✅ Created note_noteTypeId_idx index");

    // Create foreign keys for note
    try {
      await client`
        ALTER TABLE "note" 
        ADD CONSTRAINT "note_deck_id_deck_id_fk" 
        FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created note deck foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Note deck foreign key already exists");
      } else {
        throw error;
      }
    }

    try {
      await client`
        ALTER TABLE "note" 
        ADD CONSTRAINT "note_note_type_id_note_type_id_fk" 
        FOREIGN KEY ("note_type_id") REFERENCES "note_type"("id") ON DELETE RESTRICT;
      `;
      console.log("✅ Created note note_type foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Note note_type foreign key already exists");
      } else {
        throw error;
      }
    }

    // Step 3: Add note_id column to card table (nullable for backward compatibility)
    console.log("\nStep 3: Adding note_id column to card table...");
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "note_id" text;
      `;
      console.log("✅ Added note_id column to card table");

      // Create index for note_id
      await client`
        CREATE INDEX IF NOT EXISTS "card_noteId_idx" ON "card" ("note_id");
      `;
      console.log("✅ Created card_noteId_idx index");

      // Add foreign key constraint for note_id
      try {
        await client`
          ALTER TABLE "card" 
          ADD CONSTRAINT "card_note_id_note_id_fk" 
          FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE;
        `;
        console.log("✅ Created card note foreign key constraint");
      } catch (error: any) {
        if (error?.code === "42710") {
          console.log("⚠️  Card note foreign key already exists");
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  note_id column already exists");
      } else {
        throw error;
      }
    }

    // Step 4: Create triggers for updated_at on new tables
    console.log("\nStep 4: Creating triggers for updated_at...");
    // Drop trigger if exists (separate query)
    await client`
      DROP TRIGGER IF EXISTS update_note_type_updated_at ON "note_type";
    `;
    // Create trigger (separate query)
    await client`
      CREATE TRIGGER update_note_type_updated_at
        BEFORE UPDATE ON "note_type"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created note_type updated_at trigger");

    // Drop trigger if exists (separate query)
    await client`
      DROP TRIGGER IF EXISTS update_note_updated_at ON "note";
    `;
    // Create trigger (separate query)
    await client`
      CREATE TRIGGER update_note_updated_at
        BEFORE UPDATE ON "note"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created note updated_at trigger");

    // Step 5: Seed default "Basic" note type for all existing users
    console.log("\nStep 5: Seeding default 'Basic' note type for all users...");
    const users = await client`
      SELECT "id" FROM "user";
    `;

    const basicNoteTypeFields = JSON.stringify([
      { name: "Front", type: "text" },
      { name: "Back", type: "text" },
    ]);

    let seededCount = 0;
    for (const user of users) {
      // Check if user already has a Basic note type
      const existing = await client`
        SELECT "id" FROM "note_type" 
        WHERE "user_id" = ${user.id} AND "name" = 'Basic';
      `;

      if (existing.length === 0) {
        const noteTypeId = crypto.randomUUID();
        await client`
          INSERT INTO "note_type" ("id", "name", "user_id", "fields")
          VALUES (${noteTypeId}, 'Basic', ${user.id}, ${basicNoteTypeFields}::jsonb);
        `;
        seededCount++;
      }
    }
    console.log(`✅ Seeded Basic note type for ${seededCount} user(s)`);

    // Step 6: Migrate existing cards to notes
    console.log("\nStep 6: Migrating existing cards to notes...");
    const cardsWithoutNotes = await client`
      SELECT "id", "deck_id", "front", "back" 
      FROM "card" 
      WHERE "note_id" IS NULL;
    `;

    let migratedCount = 0;
    for (const card of cardsWithoutNotes) {
      // Get the deck to find the user
      const [deck] = await client`
        SELECT "user_id" FROM "deck" WHERE "id" = ${card.deck_id};
      `;

      if (!deck) {
        console.log(
          `⚠️  Deck ${card.deck_id} not found for card ${card.id}, skipping`,
        );
        continue;
      }

      // Get the Basic note type for this user
      const [noteType] = await client`
        SELECT "id" FROM "note_type" 
        WHERE "user_id" = ${deck.user_id} AND "name" = 'Basic';
      `;

      if (!noteType) {
        console.log(
          `⚠️  Basic note type not found for user ${deck.user_id}, skipping card ${card.id}`,
        );
        continue;
      }

      // Create note from card
      const noteId = crypto.randomUUID();
      const noteFields = JSON.stringify({
        Front: card.front,
        Back: card.back,
      });

      await client`
        INSERT INTO "note" ("id", "deck_id", "note_type_id", "fields")
        VALUES (${noteId}, ${card.deck_id}, ${noteType.id}, ${noteFields}::jsonb);
      `;

      // Update card to reference the note
      await client`
        UPDATE "card" 
        SET "note_id" = ${noteId}
        WHERE "id" = ${card.id};
      `;

      migratedCount++;
    }
    console.log(`✅ Migrated ${migratedCount} card(s) to notes`);

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  } finally {
    await client.end();
  }
}

migrateToNotes()
  .then(() => {
    console.log("\n🎉 Migration to notes system complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });



