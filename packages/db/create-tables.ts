// Script to create deck and card tables directly using postgres client
import { getClientInstance } from "./src/drizzle";

async function createTables() {
  const client = getClientInstance();

  try {
    console.log("Creating deck and card tables...");

    // Create deck table
    await client`
      CREATE TABLE IF NOT EXISTS "deck" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "user_id" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created deck table");

    // Create card table
    await client`
      CREATE TABLE IF NOT EXISTS "card" (
        "id" text PRIMARY KEY NOT NULL,
        "deck_id" text NOT NULL,
        "front" text NOT NULL,
        "back" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✅ Created card table");

    // Create indexes
    await client`
      CREATE INDEX IF NOT EXISTS "deck_userId_idx" ON "deck" ("user_id");
    `;
    console.log("✅ Created deck_userId_idx index");

    await client`
      CREATE INDEX IF NOT EXISTS "card_deckId_idx" ON "card" ("deck_id");
    `;
    console.log("✅ Created card_deckId_idx index");

    // Create foreign key constraints
    try {
      await client`
        ALTER TABLE "deck" 
        ADD CONSTRAINT "deck_user_id_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created deck foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Deck foreign key already exists");
      } else {
        throw error;
      }
    }

    try {
      await client`
        ALTER TABLE "card" 
        ADD CONSTRAINT "card_deck_id_deck_id_fk" 
        FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE;
      `;
      console.log("✅ Created card foreign key constraint");
    } catch (error: any) {
      if (error?.code === "42710") {
        console.log("⚠️  Card foreign key already exists");
      } else {
        throw error;
      }
    }

    // Create function to update updated_at timestamp (if it doesn't exist)
    await client`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    console.log("✅ Created update_updated_at_column function");

    // Create triggers for updated_at
    await client`
      DROP TRIGGER IF EXISTS update_deck_updated_at ON "deck";
      CREATE TRIGGER update_deck_updated_at
        BEFORE UPDATE ON "deck"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created deck updated_at trigger");

    await client`
      DROP TRIGGER IF EXISTS update_card_updated_at ON "card";
      CREATE TRIGGER update_card_updated_at
        BEFORE UPDATE ON "card"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;
    console.log("✅ Created card updated_at trigger");

    console.log("\n✅ All tables and constraints created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createTables()
  .then(() => {
    console.log("\n🎉 Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });


