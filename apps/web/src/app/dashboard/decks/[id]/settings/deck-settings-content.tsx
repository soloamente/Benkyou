import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { type Deck } from "@/lib/decks-api";
import { DeckSettingsClient } from "./deck-settings-client";

export interface DeckSettingsContentProps {
  params: Promise<{ id: string }>;
}

// Extract dynamic data fetching to a separate component.
// This component awaits params and calls an uncached fetch (cookie-auth), so it MUST be wrapped in <Suspense>
// in Next.js 16+ to avoid "Blocking Route" warnings and to keep the route streaming fast.
export async function DeckSettingsContent({
  params,
}: DeckSettingsContentProps) {
  const { id } = await params;

  // IMPORTANT:
  // We intentionally do NOT use the browser-oriented `getDeck()` helper here.
  // In server components, fetch does not automatically forward the user's cookies unless we do it ourselves.
  // So we read the incoming Cookie header and forward it to the API request, same as the deck detail page.
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

  let deck: Deck | null = null;
  try {
    const response = await fetch(`${serverUrl}/api/decks/${id}`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      // This is user-specific (cookie-auth), so we never want to cache it.
      cache: "no-store",
    });

    if (!response.ok) {
      // If the deck doesn't exist, or the user isn't authorized, show the standard not-found UI.
      notFound();
    }

    deck = (await response.json()) as Deck;
  } catch (error) {
    // If the fetch fails (API down, etc), treat it as not-found for now to avoid crashing the route.
    // (We can revisit later and show an error state instead of 404 if desired.)
    console.error("Error fetching deck settings deck:", error);
    notFound();
  }

  // Pass the deck info to the client component
  // The client component will fetch full settings on mount
  return <DeckSettingsClient deckId={id} deckName={deck.name} />;
}
