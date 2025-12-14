# Background and Motivation

We have a Next.js 16 App Router error on route `/dashboard/decks/[id]/settings`:

- "Blocking Route: Uncached data was accessed outside of <Suspense>"

The route currently awaits `params` and fetches deck data via `getDeck(id)` at the top-level of the page component. This blocks route streaming and triggers the Next.js 16 warning/error.

# Key Challenges and Analysis

- `getDeck(id)` calls `fetch()` (cookie-based auth; `credentials: "include"`) which Next considers **uncached**.
- In Next.js 16, **uncached data access must be inside a `<Suspense>` boundary** to allow the route to stream a shell immediately.
- The stack trace points to `await params`, but the fundamental issue is "top-level async work" (including `params` + `fetch`) happening outside Suspense.

# High-level Task Breakdown

## Task 1: Refactor `/dashboard/decks/[id]/settings` to stream via `<Suspense>`

- **Approach**: Make the route component render a fast shell + wrap the async data work in a child `async` component rendered inside `<Suspense>`.
- **Success criteria**:
  - The Next.js error/warning "Blocking Route" no longer appears for `/dashboard/decks/[id]/settings`.
  - The route renders quickly with a fallback UI while data loads.
  - Behavior remains correct: missing deck still triggers `notFound()`.

## Task 2: Verify no new lints/type errors

- **Success criteria**:
  - No new linter diagnostics in the edited file.

# Project Status Board

- [ ] Task 1: Add Suspense boundary + move async work to child (ready for user verification)
- [ ] Task 2: Run lint/type checks for touched files
- [ ] Task 3: Persist breadcrumb CSS preview changes for deck settings page (ready for user verification)

# Current Status / Progress Tracking

- Identified root cause: uncached fetch in `getDeck()` performed at route top-level without Suspense.
- Prepared plan to refactor route to stream.
- Implemented Suspense refactor in `apps/web/src/app/dashboard/decks/[id]/settings/page.tsx` (awaits now happen inside `DeckSettingsContent`).
- Fixed runtime crash when `getDeck()` fails by restoring a `notFound()` guard when `deck` is null.
- Updated settings page to fetch deck server-side with cookie forwarding (matches `dashboard/decks/[id]/page.tsx`), preventing false `notFound()` from missing cookies/base URL mismatch.
- Extracted `DeckSettingsContent` into `deck-settings-content.tsx` to keep `page.tsx` thin and focused on the Suspense boundary + fallback UI.
- Persisted breadcrumb CSS preview changes in `apps/web/src/app/dashboard/decks/[id]/settings/deck-settings-content.tsx` by translating them into Tailwind utility classes (width/font sizing/weight/opacity/color/alignment).
- Updated the `DeckSettingsLoading` breadcrumb skeleton in `apps/web/src/app/dashboard/decks/[id]/settings/page.tsx` to mirror the new breadcrumb layout/styles to avoid CLS.

# Executor's Feedback or Assistance Requests

- Please refresh `/dashboard/decks/[id]/settings` in the browser and confirm the \"Blocking Route\" error is gone.
  - If you still see an error, paste the updated message and stack trace here.
- Please visually verify the breadcrumb styling matches your preview:
  - The breadcrumb line should be full-width, centered, `text-lg`, `font-medium`
  - "Decks" should be ~40% opacity
  - The "/" separators should be ~50% opacity
  - Deck name + "Settings" should use the title-secondary color, with "Settings" slightly bolder (`font-semibold`)

# Lessons

- Next.js 16 may report "Blocking Route" when a page does uncached data access at the top level. Fix by moving uncached `await` work into a component rendered inside `<Suspense>` with a fast fallback.


