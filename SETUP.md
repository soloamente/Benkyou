# Database Setup Guide

This guide will help you set up Drizzle ORM with Supabase and Better Auth.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Node.js/Bun installed
3. Environment variables configured

## Step-by-Step Setup

### 1. Install Dependencies

```bash
bun install
```

This will install all required packages including:

- `drizzle-orm` - The ORM
- `drizzle-kit` - Migration tool
- `postgres` - PostgreSQL client
- `@supabase/supabase-js` - Supabase client (optional, for direct Supabase features)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then update the following variables:

```env
# Get this from Supabase Dashboard > Settings > Database > Connection string (URI mode)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Server configuration
CORS_ORIGIN=http://localhost:3001

# Better Auth configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

**To get your Supabase DATABASE_URL:**

1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Scroll to "Connection string"
4. Select "URI" mode
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

**To generate BETTER_AUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 3. Generate Better Auth Schema

Better Auth CLI will generate the database schema based on your auth configuration:

```bash
bun run auth:generate
```

This command:

- Reads your Better Auth configuration from `packages/auth/src/index.ts`
- Generates the required Drizzle schema in `packages/db/src/schema.ts`
- Includes tables for: user, session, account, verification, etc.

### 4. Generate Drizzle Migration

Create migration files from the generated schema:

```bash
bun run db:generate
```

This creates migration files in `packages/db/drizzle/` directory.

### 5. Apply Migrations

Apply the migrations to your Supabase database:

```bash
bun run db:migrate
```

This will:

- Connect to your Supabase database
- Create all required tables
- Set up indexes and constraints

### 6. Verify Setup

You can use Drizzle Studio to view your database:

```bash
bun run db:studio
```

This opens a web interface at `http://localhost:4983` where you can:

- View all tables
- Browse data
- Edit records (development only)

## Workflow for Schema Changes

When you update your Better Auth configuration:

1. **Update auth config** in `packages/auth/src/index.ts`
2. **Regenerate schema:**
   ```bash
   bun run auth:generate
   ```
3. **Generate migration:**
   ```bash
   bun run db:generate
   ```
4. **Review migration files** in `packages/db/drizzle/`
5. **Apply migration:**
   ```bash
   bun run db:migrate
   ```

## Available Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `bun run auth:generate` | Generate Better Auth schema                      |
| `bun run db:generate`   | Generate Drizzle migration files                 |
| `bun run db:migrate`    | Apply migrations to database                     |
| `bun run db:push`       | Push schema directly (dev only, not recommended) |
| `bun run db:studio`     | Open Drizzle Studio                              |

## Troubleshooting

### "DATABASE_URL environment variable is required"

- Make sure you have a `.env` file in the root directory
- Verify the `DATABASE_URL` is set correctly
- Check that the connection string includes your password

### Connection timeout errors

- Verify your Supabase project is active
- Check that your IP is allowed in Supabase dashboard (Settings > Database > Connection pooling)
- For production, consider using Supabase connection pooling

### Migration errors

- Make sure you've run `auth:generate` first
- Check that your database is accessible
- Review migration files in `packages/db/drizzle/` for issues

### Schema not found errors

- Run `bun run auth:generate` to create the schema
- Verify `packages/db/src/schema.ts` exists and is properly formatted

## Best Practices

1. **Always review migration files** before applying them
2. **Use migrations in production**, not `db:push`
3. **Backup your database** before running migrations
4. **Test migrations** in a development environment first
5. **Keep schema.ts in version control** (it's generated but should be committed)

## Next Steps

After setup, your Better Auth instance in `packages/auth/src/index.ts` is configured to use Drizzle with Supabase. You can now:

- Use authentication features in your Elysia server
- Access the database via `@benkyou/db` package
- Add custom tables alongside Better Auth tables
