# Migration Guide

This guide explains how to work with database migrations using Drizzle and Better Auth.

## Initial Setup

### 1. Generate Better Auth Schema

First, generate the database schema based on your Better Auth configuration:

```bash
bun run auth:generate
```

This command:

- Reads `packages/auth/src/index.ts` for Better Auth configuration
- Generates Drizzle schema in `packages/db/src/schema.ts`
- Includes all tables required by Better Auth and enabled plugins

**Important:** Run this command whenever you:

- Add new Better Auth plugins
- Change authentication methods
- Update Better Auth configuration

### 2. Generate Migration Files

After generating the schema, create migration files:

```bash
bun run db:generate
```

This creates migration files in `packages/db/drizzle/` that contain SQL statements to:

- Create new tables
- Add new columns
- Modify existing columns
- Create indexes

### 3. Review Migration Files

**Always review migration files before applying them!**

Check the generated files in `packages/db/drizzle/`:

- Look for any unexpected changes
- Verify table structures match your expectations
- Check for data loss (dropping columns, etc.)

### 4. Apply Migrations

Apply migrations to your database:

```bash
bun run db:migrate
```

This will:

- Connect to your Supabase database
- Execute the migration SQL
- Update the migration history

## Workflow Examples

### Adding a New Better Auth Plugin

1. Update `packages/auth/src/index.ts` to include the new plugin
2. Run `bun run auth:generate` to update the schema
3. Run `bun run db:generate` to create migration
4. Review the migration files
5. Run `bun run db:migrate` to apply

### Adding Custom Tables

1. Add your table definition to `packages/db/src/schema.ts`:

   ```typescript
   import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

   export const posts = pgTable("posts", {
     id: text("id").primaryKey(),
     title: text("title").notNull(),
     content: text("content"),
     createdAt: timestamp("created_at").defaultNow(),
   });
   ```

2. Export it from the schema:

   ```typescript
   export * from "./schema";
   ```

3. Run `bun run db:generate` to create migration
4. Review and apply with `bun run db:migrate`

## Commands Reference

| Command                 | When to Use                                          |
| ----------------------- | ---------------------------------------------------- |
| `bun run auth:generate` | After changing Better Auth config                    |
| `bun run db:generate`   | After schema changes                                 |
| `bun run db:migrate`    | To apply migrations to database                      |
| `bun run db:push`       | **Dev only** - Direct schema push (skips migrations) |
| `bun run db:studio`     | To view/edit database in browser                     |

## Best Practices

### ✅ Do

- Always review migrations before applying
- Test migrations in development first
- Commit migration files to version control
- Keep schema.ts in sync with Better Auth config
- Use migrations in production (not `db:push`)

### ❌ Don't

- Don't edit migration files after generating them
- Don't use `db:push` in production
- Don't skip reviewing migrations
- Don't delete old migration files
- Don't manually edit the database schema

## Troubleshooting

### Migration Fails

If a migration fails:

1. **Check the error message** - It usually indicates what went wrong
2. **Verify DATABASE_URL** - Make sure it's correct and accessible
3. **Check database permissions** - Ensure the user has CREATE/ALTER permissions
4. **Review migration file** - Look for syntax errors or conflicts

### Schema Out of Sync

If your schema is out of sync:

1. **Regenerate schema:**

   ```bash
   bun run auth:generate
   ```

2. **Generate new migration:**

   ```bash
   bun run db:generate
   ```

3. **Review the diff** - Check what changed
4. **Apply migration:**
   ```bash
   bun run db:migrate
   ```

### Rollback

Drizzle doesn't automatically generate rollback migrations. To rollback:

1. **Create a new migration** that reverses the changes
2. **Or manually edit the database** (not recommended)
3. **Or restore from backup** (recommended for production)

## Production Considerations

1. **Backup before migrations** - Always backup your database
2. **Test in staging** - Test migrations in a staging environment first
3. **Schedule migrations** - Plan migrations during low-traffic periods
4. **Monitor after migration** - Watch for errors or performance issues
5. **Have a rollback plan** - Know how to revert if something goes wrong

## Example: Complete Migration Flow

```bash
# 1. Update Better Auth config (add OAuth provider)
# Edit packages/auth/src/index.ts

# 2. Generate new schema
bun run auth:generate

# 3. Generate migration
bun run db:generate

# 4. Review migration files
cat packages/db/drizzle/0001_add_oauth_tables.sql

# 5. Apply migration
bun run db:migrate

# 6. Verify in Drizzle Studio
bun run db:studio
```
