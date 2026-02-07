import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DeckSettingsRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/decks/${id}?tab=settings`);
}

/**
 * Redirect /decks/[id]/settings to /decks/[id]?tab=settings
 * Settings are now shown as a tab on the deck detail page.
 */
export default function DeckSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <DeckSettingsRedirect params={params} />
    </Suspense>
  );
}
