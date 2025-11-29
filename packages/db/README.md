# @benkyou/db

Database package using Drizzle ORM with Supabase (PostgreSQL).

## Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the root directory
   - Add your Supabase `DATABASE_URL` from Supabase Dashboard > Settings > Database > Connection string (URI mode)

3. **Generate Better Auth schema:**

   ```bash
   bun run auth:generate
   ```

   This will generate the required database schema based on your Better Auth configuration.

4. **Generate Drizzle migration:**

   ```bash
   bun run db:generate
   ```

   This creates migration files in the `drizzle/` directory.

5. **Apply migrations to database:**
   ```bash
   bun run db:migrate
   ```
   Or use push for development (not recommended for production):
   ```bash
   bun run db:push
   ```

## Available Scripts

- `db:generate` - Generate Drizzle migration files
- `db:migrate` - Apply migrations to the database
- `db:push` - Push schema changes directly (dev only)
- `db:studio` - Open Drizzle Studio to view/edit database

## Workflow

1. Update Better Auth configuration in `packages/auth/src/index.ts`
2. Run `bun run auth:generate` to regenerate schema
3. Run `bun run db:generate` to create migration
4. Review migration files in `drizzle/` directory
5. Run `bun run db:migrate` to apply changes

## Supabase Connection

The package uses `postgres-js` to connect to Supabase. Make sure your `DATABASE_URL` is in the format:

```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

You can find this in your Supabase Dashboard under Settings > Database > Connection string (URI mode).
