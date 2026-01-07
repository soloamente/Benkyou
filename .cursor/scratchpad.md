# Background and Motivation

## New Feature: Admin Panel

The user needs a comprehensive admin panel to:
- Control and manage waitlist users
- Manage active users
- View app activity and statistics
- Ban/unban users
- Follow the same design patterns and style as the existing application

The admin panel should be accessible only to admin users and provide a complete dashboard for managing the application.

---

## Previous Task (Completed): Next.js 16 Suspense Issue

We had a Next.js 16 App Router error on route `/dashboard/decks/[id]/settings`:

- "Blocking Route: Uncached data was accessed outside of <Suspense>"

The route currently awaits `params` and fetches deck data via `getDeck(id)` at the top-level of the page component. This blocks route streaming and triggers the Next.js 16 warning/error.

# Key Challenges and Analysis

## Admin Panel Challenges

**UPDATE: Using Better Auth Admin Plugin**

We'll use Better Auth's built-in admin plugin which provides:
- User management (create, list, update, ban/unban, remove)
- Role management (set roles, check permissions)
- Session management (list, revoke sessions)
- Impersonation functionality
- Access control with custom permissions

The plugin automatically handles:
- Database schema (adds `role`, `banned`, `banReason`, `banExpires` to user table)
- Admin authentication and authorization
- API endpoints for all admin operations

1. **Database Schema**:
   - Better Auth admin plugin will add required fields automatically via migration
   - Need to create a `waitlist` table for managing waitlist entries
   - Need to track user activity for analytics (optional)

2. **Plugin Integration**:
   - Add admin plugin to server auth config
   - Add admin client plugin to client auth config
   - Run migrations to add admin fields

3. **Custom Features**:
   - Waitlist management (custom implementation)
   - Activity tracking and statistics (custom implementation)
   - Statistics dashboard (custom implementation)

4. **UI/UX Design**:
   - Follow existing design patterns (rounded corners, card-based layouts)
   - Use same color scheme and typography
   - Create responsive admin dashboard
   - Implement data tables with sorting and filtering
   - Add statistics cards and charts
   - Use Better Auth admin client methods for user management

## Previous Task Analysis

- `getDeck(id)` calls `fetch()` (cookie-based auth; `credentials: "include"`) which Next considers **uncached**.
- In Next.js 16, **uncached data access must be inside a `<Suspense>` boundary** to allow the route to stream a shell immediately.
- The stack trace points to `await params`, but the fundamental issue is "top-level async work" (including `params` + `fetch`) happening outside Suspense.

# High-level Task Breakdown

## Phase 1: Better Auth Admin Plugin Setup

### Task 1.1: Add admin plugin to server auth config
- **Approach**: Import and add `admin()` plugin to the auth config in `packages/auth/src/index.ts`
- **Success criteria**:
  - Plugin imported from `better-auth/plugins`
  - Plugin added to plugins array
  - No TypeScript errors

### Task 1.2: Add admin client plugin to client auth config
- **Approach**: Import and add `adminClient()` plugin to the auth client in `apps/web/src/lib/auth-client.ts`
- **Success criteria**:
  - Plugin imported from `better-auth/client/plugins`
  - Plugin added to plugins array
  - No TypeScript errors

### Task 1.3: Run migrations to add admin fields
- **Approach**: Run Better Auth CLI migration to add `role`, `banned`, `banReason`, `banExpires` fields to user table
- **Success criteria**:
  - Migration runs successfully
  - Database schema updated
  - Existing users have default `role: "user"` and `banned: false`

### Task 1.4: Create waitlist table
- **Approach**: Create new `waitlist` table in `packages/db/src/schema.ts` with fields: id, email, name (optional), createdAt, updatedAt, status (pending/approved/rejected)
- **Success criteria**:
  - Table created with proper indexes
  - Schema exported and types generated
  - Migration created and applied

### Task 1.5: Create activity log table (optional but recommended)
- **Approach**: Create `activity_log` table to track user actions (login, logout, study sessions, etc.)
- **Success criteria**:
  - Table created with proper indexes
  - Can efficiently query recent activity

## Phase 2: Backend API Implementation

### Task 2.1: Create waitlist API routes
- **Approach**: Create Elysia routes for waitlist management (Better Auth admin handles user management):
  - GET `/api/admin/waitlist` - List all waitlist entries (with pagination/filtering)
  - POST `/api/admin/waitlist/:id/approve` - Approve waitlist entry
  - POST `/api/admin/waitlist/:id/reject` - Reject waitlist entry
  - DELETE `/api/admin/waitlist/:id` - Delete waitlist entry
- **Success criteria**:
  - All routes protected by admin check (using Better Auth session)
  - Proper validation and error handling
  - Follows Elysia patterns

### Task 2.2: Create statistics API routes
- **Approach**: Create routes for:
  - GET `/api/admin/stats/overview` - Overall app statistics (total users, active users, study sessions, etc.)
  - GET `/api/admin/stats/activity` - Activity statistics (daily/weekly/monthly)
  - GET `/api/admin/stats/users` - User growth statistics
- **Success criteria**:
  - Returns aggregated statistics
  - Efficient queries (use indexes)
  - Proper date range filtering
  - Protected by admin check

## Phase 3: Frontend Implementation

### Task 3.1: Create admin layout and navigation
- **Approach**: Create `/app/admin` route with layout, sidebar navigation, and protected route wrapper
- **Success criteria**:
  - Only accessible to admin users
  - Redirects non-admin users
  - Follows existing design patterns
  - Responsive navigation

### Task 3.2: Create waitlist management page
- **Approach**: Create `/app/admin/waitlist` page with:
  - Table showing waitlist entries
  - Search and filter functionality
  - Approve/Reject/Delete actions
  - Pagination
- **Success criteria**:
  - Matches existing design style
  - All actions work correctly
  - Proper loading and error states

### Task 3.3: Create user management page
- **Approach**: Create `/app/admin/users` page using Better Auth admin client methods:
  - Table showing all users (using `authClient.admin.listUsers()`)
  - Search, filter, and sort functionality (using Better Auth query params)
  - User details modal/drawer
  - Ban/Unban actions (using `authClient.admin.banUser()` / `authClient.admin.unbanUser()`)
  - Set role action (using `authClient.admin.setRole()`)
  - View user sessions (using `authClient.admin.listUserSessions()`)
  - Impersonate user (using `authClient.admin.impersonateUser()`)
- **Success criteria**:
  - Matches existing design style
  - All Better Auth admin methods work correctly
  - Proper loading and error states
  - Responsive table
  - Pagination works correctly

### Task 3.4: Create statistics dashboard
- **Approach**: Create `/app/admin/stats` page with:
  - Overview cards (total users, active users, etc.)
  - Activity charts (line/bar charts)
  - Recent activity feed
  - User growth visualization
- **Success criteria**:
  - Matches existing design style
  - Charts render correctly
  - Data updates properly
  - Responsive layout

### Task 3.5: Create activity log page
- **Approach**: Create `/app/admin/activity` page with:
  - Filterable activity log table
  - User, action type, and date filters
  - Pagination
- **Success criteria**:
  - Matches existing design style
  - Filters work correctly
  - Efficient loading

## Phase 4: Testing and Polish

### Task 4.1: Test all admin functionality
- **Approach**: Manually test all admin routes and UI components
- **Success criteria**:
  - All CRUD operations work
  - Proper error handling
  - Non-admin users cannot access

### Task 4.2: Add loading states and error handling
- **Approach**: Ensure all async operations have proper loading states and error messages
- **Success criteria**:
  - No unhandled errors
  - User-friendly error messages
  - Proper loading indicators

### Task 4.3: Verify design consistency
- **Approach**: Review all admin pages to ensure they match existing design patterns
- **Success criteria**:
  - Consistent spacing, colors, typography
  - Same rounded corners and card styles
  - Responsive on all screen sizes

---

## Previous Tasks (Completed)

### Task 1: Refactor `/dashboard/decks/[id]/settings` to stream via `<Suspense>`
- **Status**: Completed
- **Success criteria**: Met

### Task 2: Verify no new lints/type errors
- **Status**: Completed
- **Success criteria**: Met

# Project Status Board

## Admin Panel Implementation

### Phase 1: Database Schema
- [x] Task 1.1: Add admin and ban fields to user table (via Better Auth admin plugin)
- [x] Task 1.2: Create waitlist table
- [ ] Task 1.3: Create activity log table (optional, skipped for now)

### Phase 2: Backend API
- [x] Task 2.1: Create admin middleware
- [x] Task 2.2: Create waitlist API routes
- [x] Task 2.3: User management handled by Better Auth admin plugin (no custom routes needed)
- [x] Task 2.4: Create statistics API routes

### Phase 3: Frontend
- [x] Task 3.1: Create admin layout and navigation
- [x] Task 3.2: Create waitlist management page
- [x] Task 3.3: Create user management page (using Better Auth admin client)
- [x] Task 3.4: Create statistics dashboard
- [ ] Task 3.5: Create activity log page (optional, skipped for now)

### Phase 4: Testing and Polish
- [ ] Task 4.1: Test all admin functionality
- [x] Task 4.2: Add loading states and error handling
- [x] Task 4.3: Verify design consistency (matches existing design patterns)

---

## Previous Tasks (Completed)
- [x] Task 1: Add Suspense boundary + move async work to child
- [x] Task 2: Run lint/type checks for touched files
- [x] Task 3: Persist breadcrumb CSS preview changes for deck settings page
- [x] Task 4: Make deck settings right-hand sidebar width flexible

# Current Status / Progress Tracking

## Admin Panel - Implementation Complete

- **Status**: ✅ Implementation complete - ready for testing
- **Completed**: All core admin panel features implemented
- **Approach**: Used Better Auth admin plugin for user management, custom routes for waitlist and stats
- **Design**: Matches existing UI patterns (rounded corners, card layouts, SF Pro Rounded font, Tailwind CSS)

### What Was Implemented:

1. **Better Auth Admin Plugin Integration**:
   - Added admin plugin to server and client configs
   - Migration applied successfully (admin fields added to user table)
   - Admin middleware created to protect admin routes

2. **Database Schema**:
   - Admin fields added: `role`, `banned`, `banReason`, `banExpires` on user table
   - `impersonatedBy` field added to session table
   - Waitlist table created with proper indexes

3. **Backend API Routes**:
   - `/api/admin/waitlist` - List, approve, reject, delete waitlist entries
   - `/api/admin/stats/overview` - Overall app statistics
   - `/api/admin/stats/activity` - Activity statistics (daily/weekly/monthly)
   - `/api/admin/stats/users` - User growth statistics
   - All routes protected by admin middleware

4. **Frontend Admin Panel**:
   - Admin layout with navigation (`/admin`)
   - Overview dashboard with statistics cards (`/admin`)
   - User management page using Better Auth admin methods (`/admin/users`)
   - Waitlist management page (`/admin/waitlist`)
   - All pages follow existing design patterns

### Next Steps for User:

1. **Set First Admin User**: 
   - Update a user's role to "admin" in the database:
     ```sql
     UPDATE "user" SET "role" = 'admin' WHERE "email" = 'your-email@example.com';
     ```

2. **Test Admin Panel**:
   - Navigate to `/admin` as an admin user
   - Test waitlist management
   - Test user management (ban/unban, set role)
   - Verify statistics are loading correctly

3. **Optional Enhancements**:
   - Add activity log table and page (if needed)
   - Add more detailed user activity tracking
   - Add export functionality for waitlist/users

## Previous Task Status (Completed)

- Identified root cause: uncached fetch in `getDeck()` performed at route top-level without Suspense.
- Prepared plan to refactor route to stream.
- Implemented Suspense refactor in `apps/web/src/app/dashboard/decks/[id]/settings/page.tsx` (awaits now happen inside `DeckSettingsContent`).
- Fixed runtime crash when `getDeck()` fails by restoring a `notFound()` guard when `deck` is null.
- Updated settings page to fetch deck server-side with cookie forwarding (matches `dashboard/decks/[id]/page.tsx`), preventing false `notFound()` from missing cookies/base URL mismatch.
- Extracted `DeckSettingsContent` into `deck-settings-content.tsx` to keep `page.tsx` thin and focused on the Suspense boundary + fallback UI.
- Persisted breadcrumb CSS preview changes in `apps/web/src/app/dashboard/decks/[id]/settings/deck-settings-content.tsx` by translating them into Tailwind utility classes (width/font sizing/weight/opacity/color/alignment).
- Updated the `DeckSettingsLoading` breadcrumb skeleton in `apps/web/src/app/dashboard/decks/[id]/settings/page.tsx` to mirror the new breadcrumb layout/styles to avoid CLS.
- Adjusted the right-hand sidebar container in `deck-settings-content.tsx` from `flex-0 min-w-[280px]` to `flex-1 min-w-0` so its width is now flexible (`width: 100%`) and can shrink to fit the available page width while staying in the flex layout.

# Executor's Feedback or Assistance Requests

## Admin Panel Implementation

**Ready to begin implementation.** The plan is comprehensive and follows all existing patterns. 

**Questions for user:**
1. Should we implement activity logging (Task 1.3) or is it optional for now?
2. Do you want real-time updates for statistics, or is periodic refresh sufficient?
3. Should admin users be able to see user passwords or other sensitive data? (We should NOT expose passwords)
4. What should be the default admin user? Should we create a migration script to set a specific user as admin?

**Next Steps:**
- Awaiting user confirmation to proceed with Phase 1 (Database Schema Updates)
- Once confirmed, will start with Task 1.1: Add admin and ban fields to user table

---

## Previous Task Feedback (Completed)

- Please refresh `/dashboard/decks/[id]/settings` in the browser and confirm the \"Blocking Route\" error is gone.
  - If you still see an error, paste the updated message and stack trace here.
- Please visually verify the breadcrumb styling matches your preview:
- The breadcrumb line should be full-width, centered, `text-lg`, `font-medium`
- "Decks" should be ~40% opacity
- The "/" separators should be ~50% opacity
- Deck name + "Settings" should use the title-secondary color, with "Settings" slightly bolder (`font-semibold`)
- Please also check the deck settings layout: the right-hand "settings" sidebar should no longer be locked to 280px and should be able to shrink with the page while still participating in the main flex row.

# Lessons

- Next.js 16 may report "Blocking Route" when a page does uncached data access at the top level. Fix by moving uncached `await` work into a component rendered inside `<Suspense>` with a fast fallback.


