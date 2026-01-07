// Quick script to verify the migration was marked correctly
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

const envPaths = [
  resolve(process.cwd(), "apps/server/.env"),
  resolve(process.cwd(), ".env"),
  resolve(__dirname, "../../apps/server/.env"),
  resolve(__dirname, "../../.env"),
];

for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (process.env.DATABASE_URL) break;
  } catch {}
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

async function verify() {
  const sql = postgres(process.env.DATABASE_URL!);
  
  try {
    const migrations = await sql`
      SELECT * FROM drizzle.__drizzle_migrations 
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log("Recent migrations:");
    migrations.forEach((m: any) => {
      console.log(`  - ID: ${m.id}, Hash: ${m.hash.substring(0, 20)}..., Created: ${new Date(Number(m.created_at)).toISOString()}`);
    });
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    await sql.end();
    process.exit(1);
  }
}

verify();
