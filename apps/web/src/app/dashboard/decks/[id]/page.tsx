import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";

import DeckDetail from "./deck-detail";

// Extract dynamic data fetching to a separate component
// This component accesses headers, params, and makes API calls, so it needs to be wrapped in Suspense
async function DeckDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get headers for server-side session retrieval
  const headersList = await headers();

  // Convert Next.js ReadonlyHeaders to Headers object for Better Auth
  const authHeaders = new Headers();
  headersList.forEach((value, key) => {
    authHeaders.set(key, value);
  });

  // Use server-side auth API to get session
  const session = await auth.api.getSession({
    headers: authHeaders,
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Get deck ID from params
  const { id } = await params;

  // Fetch deck from API using server-side fetch with proper cookie forwarding
  const serverUrl = process.env.SERVER_URL || "http://localhost:3000";
  const cookieHeader = headersList.get("cookie") || "";

  let deck;
  try {
    const response = await fetch(`${serverUrl}/api/decks/${id}`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      // Don't cache this request
      cache: "no-store",
    });

    if (!response.ok) {
      // If deck not found or unauthorized, redirect to dashboard
      redirect("/dashboard");
    }

    deck = await response.json();
  } catch (error) {
    // If fetch fails, redirect to dashboard
    console.error("Error fetching deck:", error);
    redirect("/dashboard");
  }

  // Verify the deck belongs to the user (double check on server side)
  if (deck.userId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 overflow-y-auto">
        <DeckDetail deck={deck} session={session} />
      </div>
    </>
  );
}

// Loading fallback for Suspense boundary
function DeckDetailLoading() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading deck...</p>
        </div>
      </div>
    </>
  );
}

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DeckDetailLoading />}>
      <DeckDetailContent params={params} />
    </Suspense>
  );
}
