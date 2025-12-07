// Quick script to verify deck and card tables exist
import { db } from "./src/drizzle";
import { sql } from "drizzle-orm";

async function verifyTables() {
  try {
    console.log("Checking database tables...");

    // Check if deck table exists
    const deckCheck = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'deck'
      );`,
    );

    // Check if card table exists
    const cardCheck = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'card'
      );`,
    );

    const deckExists = (deckCheck[0] as { exists: boolean }).exists;
    const cardExists = (cardCheck[0] as { exists: boolean }).exists;

    console.log("\nTable verification:");
    console.log(`  deck table: ${deckExists ? "✅ EXISTS" : "❌ MISSING"}`);
    console.log(`  card table: ${cardExists ? "✅ EXISTS" : "❌ MISSING"}`);

    if (deckExists && cardExists) {
      console.log("\n✅ All tables are created successfully!");
      const client = await import("./src/drizzle.js").then((m) =>
        m.getClientInstance(),
      );
      await client.end();
      process.exit(0);
    } else {
      console.log("\n❌ Some tables are missing. Run 'bun run db:push' again.");
      const client = await import("./src/drizzle.js").then((m) =>
        m.getClientInstance(),
      );
      await client.end();
      process.exit(1);
    }
  } catch (error) {
    console.error("Error verifying tables:", error);
    process.exit(1);
  }
}

verifyTables();



