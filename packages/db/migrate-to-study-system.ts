// Migration script to add FSRS study system
// This script:
// 1. Adds FSRS fields to card table
// 2. Creates study_session, study_record, and user_study_settings tables
// 3. Initializes default values for existing cards
// 4. Creates default study settings for existing users
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from multiple possible locations
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

async function migrateToStudySystem() {
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
    console.log("Starting migration to study system...\n");

    // Step 1: Add FSRS fields to card table
    console.log("Step 1: Adding FSRS fields to card table...");

    // Add state column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "state" text NOT NULL DEFAULT 'new';
      `;
      console.log("✅ Added state column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  state column already exists");
      } else {
        throw error;
      }
    }

    // Add difficulty column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "difficulty" real NOT NULL DEFAULT 0.3;
      `;
      console.log("✅ Added difficulty column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  difficulty column already exists");
      } else {
        throw error;
      }
    }

    // Add stability column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "stability" real NOT NULL DEFAULT 0;
      `;
      console.log("✅ Added stability column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  stability column already exists");
      } else {
        throw error;
      }
    }

    // Add last_review column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "last_review" timestamp;
      `;
      console.log("✅ Added last_review column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  last_review column already exists");
      } else {
        throw error;
      }
    }

    // Add due_date column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "due_date" timestamp;
      `;
      console.log("✅ Added due_date column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  due_date column already exists");
      } else {
        throw error;
      }
    }

    // Add interval column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "interval" real NOT NULL DEFAULT 0;
      `;
      console.log("✅ Added interval column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  interval column already exists");
      } else {
        throw error;
      }
    }

    // Add repetitions column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "repetitions" integer NOT NULL DEFAULT 0;
      `;
      console.log("✅ Added repetitions column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  repetitions column already exists");
      } else {
        throw error;
      }
    }

    // Add lapses column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "lapses" integer NOT NULL DEFAULT 0;
      `;
      console.log("✅ Added lapses column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  lapses column already exists");
      } else {
        throw error;
      }
    }

    // Add elapsed_days column
    try {
      await client`
        ALTER TABLE "card" 
        ADD COLUMN IF NOT EXISTS "elapsed_days" integer NOT NULL DEFAULT 0;
      `;
      console.log("✅ Added elapsed_days column to card table");
    } catch (error: any) {
      if (error?.code === "42704") {
        console.log("⚠️  elapsed_days column already exists");
      } else {
        throw error;
      }
    }

    // Create indexes for card table
    await client`
      CREATE INDEX IF NOT EXISTS "card_dueDate_idx" ON "card" ("due_date");
    `;
    console.log("✅ Created card_dueDate_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "card_state_idx" ON "card" ("state");
    `;
    console.log("✅ Created card_state_idx index");

    // Step 2: Create study_session table
    console.log("\nStep 2: Creating study_session table...");
    await client`
      CREATE TABLE IF NOT EXISTS "study_session" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "deck_id" text,
        "started_at" timestamp DEFAULT now() NOT NULL,
        "ended_at" timestamp,
        "cards_studied" integer DEFAULT 0 NOT NULL,
        "cards_correct" integer DEFAULT 0 NOT NULL,
        "cards_incorrect" integer DEFAULT 0 NOT NULL,
        "duration" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created study_session table");

    // Create indexes for study_session
    await client`
      CREATE INDEX IF NOT EXISTS "study_session_userId_idx" ON "study_session" ("user_id");
    `;
    console.log("✅ Created study_session_userId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "study_session_deckId_idx" ON "study_session" ("deck_id");
    `;
    console.log("✅ Created study_session_deckId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "study_session_startedAt_idx" ON "study_session" ("started_at");
    `;
    console.log("✅ Created study_session_startedAt_idx index");

    // Create foreign keys for study_session
    try {
      await client`
        ALTER TABLE "study_session" 
        ADD CONSTRAINT "study_session_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created study_session user foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Study session user foreign key already exists");
      } else {
        throw error;
      }
    }

    try {
      await client`
        ALTER TABLE "study_session" 
        ADD CONSTRAINT "study_session_deck_id_deck_id_fk" 
        FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE SET NULL;
      `;
      console.log("✅ Created study_session deck foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Study session deck foreign key already exists");
      } else {
        throw error;
      }
    }

    // Step 3: Create study_record table
    console.log("\nStep 3: Creating study_record table...");
    await client`
      CREATE TABLE IF NOT EXISTS "study_record" (
        "id" text PRIMARY KEY NOT NULL,
        "card_id" text NOT NULL,
        "session_id" text NOT NULL,
        "rating" integer NOT NULL,
        "reviewed_at" timestamp DEFAULT now() NOT NULL,
        "response_time" integer DEFAULT 0 NOT NULL,
        "previous_state" text NOT NULL,
        "new_state" text NOT NULL,
        "previous_difficulty" real NOT NULL,
        "new_difficulty" real NOT NULL,
        "previous_stability" real NOT NULL,
        "new_stability" real NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created study_record table");

    // Create indexes for study_record
    await client`
      CREATE INDEX IF NOT EXISTS "study_record_cardId_idx" ON "study_record" ("card_id");
    `;
    console.log("✅ Created study_record_cardId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "study_record_sessionId_idx" ON "study_record" ("session_id");
    `;
    console.log("✅ Created study_record_sessionId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "study_record_reviewedAt_idx" ON "study_record" ("reviewed_at");
    `;
    console.log("✅ Created study_record_reviewedAt_idx index");

    // Create foreign keys for study_record
    try {
      await client`
        ALTER TABLE "study_record" 
        ADD CONSTRAINT "study_record_card_id_card_id_fk" 
        FOREIGN KEY ("card_id") REFERENCES "card"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created study_record card foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Study record card foreign key already exists");
      } else {
        throw error;
      }
    }

    try {
      await client`
        ALTER TABLE "study_record" 
        ADD CONSTRAINT "study_record_session_id_study_session_id_fk" 
        FOREIGN KEY ("session_id") REFERENCES "study_session"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created study_record session foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Study record session foreign key already exists");
      } else {
        throw error;
      }
    }

    // Step 4: Create user_study_settings table
    console.log("\nStep 4: Creating user_study_settings table...");
    await client`
      CREATE TABLE IF NOT EXISTS "user_study_settings" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL UNIQUE,
        "new_cards_per_day" integer DEFAULT 20 NOT NULL,
        "max_reviews_per_day" integer DEFAULT 200 NOT NULL,
        "learning_steps" jsonb DEFAULT '[1, 10]'::jsonb NOT NULL,
        "graduating_interval" integer DEFAULT 1 NOT NULL,
        "easy_interval" integer DEFAULT 4 NOT NULL,
        "minimum_interval" integer DEFAULT 1 NOT NULL,
        "maximum_interval" integer DEFAULT 36500 NOT NULL,
        "relearning_steps" jsonb DEFAULT '[10]'::jsonb NOT NULL,
        "fsrs_parameters" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created user_study_settings table");

    // Create index for user_study_settings
    await client`
      CREATE INDEX IF NOT EXISTS "user_study_settings_userId_idx" ON "user_study_settings" ("user_id");
    `;
    console.log("✅ Created user_study_settings_userId_idx index");

    // Create foreign key for user_study_settings
    try {
      await client`
        ALTER TABLE "user_study_settings" 
        ADD CONSTRAINT "user_study_settings_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created user_study_settings user foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  User study settings foreign key already exists");
      } else {
        throw error;
      }
    }

    // Step 5: Create triggers for updated_at on new tables
    console.log("\nStep 5: Creating triggers for updated_at...");

    // Drop trigger if exists (separate query)
    await client`
      DROP TRIGGER IF EXISTS update_study_session_updated_at ON "study_session";
    `;
    // Create trigger (separate query)
    await client`
      CREATE TRIGGER update_study_session_updated_at
        BEFORE UPDATE ON "study_session"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created study_session updated_at trigger");

    // Drop trigger if exists (separate query)
    await client`
      DROP TRIGGER IF EXISTS update_user_study_settings_updated_at ON "user_study_settings";
    `;
    // Create trigger (separate query)
    await client`
      CREATE TRIGGER update_user_study_settings_updated_at
        BEFORE UPDATE ON "user_study_settings"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created user_study_settings updated_at trigger");

    // Step 6: Initialize default values for existing cards
    console.log("\nStep 6: Initializing default values for existing cards...");
    const result = await client`
      UPDATE "card"
      SET 
        "state" = 'new',
        "difficulty" = 0.3,
        "stability" = 0,
        "interval" = 0,
        "repetitions" = 0,
        "lapses" = 0,
        "elapsed_days" = 0
      WHERE "state" IS NULL OR "difficulty" IS NULL OR "stability" IS NULL;
    `;
    console.log(`✅ Initialized default values for existing cards`);

    // Step 7: Create default study settings for existing users
    console.log(
      "\nStep 7: Creating default study settings for existing users...",
    );
    const users = await client`
      SELECT "id" FROM "user";
    `;

    const defaultLearningSteps = JSON.stringify([1, 10]);
    const defaultRelearningSteps = JSON.stringify([10]);

    let settingsCount = 0;
    for (const user of users) {
      // Check if user already has study settings
      const existing = await client`
        SELECT "id" FROM "user_study_settings" 
        WHERE "user_id" = ${user.id};
      `;

      if (existing.length === 0) {
        const settingsId = crypto.randomUUID();
        await client`
          INSERT INTO "user_study_settings" (
            "id", "user_id", "new_cards_per_day", "max_reviews_per_day",
            "learning_steps", "graduating_interval", "easy_interval",
            "minimum_interval", "maximum_interval", "relearning_steps"
          )
          VALUES (
            ${settingsId}, ${user.id}, 20, 200,
            ${defaultLearningSteps}::jsonb, 1, 4,
            1, 36500, ${defaultRelearningSteps}::jsonb
          );
        `;
        settingsCount++;
      }
    }
    console.log(
      `✅ Created default study settings for ${settingsCount} user(s)`,
    );

    console.log("\n✅ Migration to study system complete!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  } finally {
    await client.end();
  }
}

migrateToStudySystem()
  .then(() => {
    console.log("\n🎉 Migration to study system complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });



