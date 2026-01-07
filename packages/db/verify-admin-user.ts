// Script to verify admin user setup
// Run with: bun run packages/db/verify-admin-user.ts

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
    if (process.env.DATABASE_URL) {
      console.log(`Loaded DATABASE_URL from: ${envPath}`);
      break;
    }
  } catch {}
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

async function verifyAdmin() {
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    console.log("Checking admin users in database...\n");

    const adminUsers = await sql`
      SELECT id, email, name, role, banned, created_at
      FROM "user"
      WHERE role = 'admin' OR role LIKE '%admin%'
      ORDER BY created_at DESC
    `;

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found in database!");
      console.log("\nTo set a user as admin, run:");
      console.log('  UPDATE "user" SET "role" = \'admin\' WHERE "email" = \'your-email@example.com\';');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      adminUsers.forEach((user: any) => {
        console.log(`  - Email: ${user.email}`);
        console.log(`    Name: ${user.name || "N/A"}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Banned: ${user.banned ? "Yes" : "No"}`);
        console.log(`    ID: ${user.id}`);
        console.log("");
      });
    }

    // Also check all users with roles
    const allUsersWithRoles = await sql`
      SELECT id, email, name, role
      FROM "user"
      WHERE role IS NOT NULL
      ORDER BY role, email
    `;

    if (allUsersWithRoles.length > 0) {
      console.log(`\nAll users with roles (${allUsersWithRoles.length}):`);
      allUsersWithRoles.forEach((user: any) => {
        console.log(`  - ${user.email}: role = "${user.role}"`);
      });
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await sql.end();
    process.exit(1);
  }
}

verifyAdmin();
