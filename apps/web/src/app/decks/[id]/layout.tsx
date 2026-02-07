import { Suspense } from "react";
import { DeckDetailNavbar } from "./deck-detail-navbar";
import { DeckDetailBottomNavbar } from "./deck-detail-bottom-navbar";

/**
 * Async inner layout that awaits params. Wrapped in Suspense to avoid blocking route.
 */
async function DeckLayoutContent({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;

  return (
    <main className="m-2.5 bg-background h-screen overflow-y-auto">
      <div className="bg-card p-2.5 rounded-3xl gap-2.5 flex flex-col h-full overflow-hidden font-medium mx-auto w-full">
        <DeckDetailNavbar deckId={id} />
        <div className="flex flex-col gap-3.75 flex-1 overflow-auto min-h-0">
          {children}
        </div>
      </div>
      <DeckDetailBottomNavbar deckId={id} />
    </main>
  );
}

function DeckLayoutFallback() {
  return (
    <main className="m-2.5 bg-background h-screen overflow-y-auto">
      <div className="bg-card p-2.5 rounded-3xl gap-2.5 flex flex-col h-full overflow-hidden font-medium mx-auto w-full">
        <div className="flex gap-2 p-2.5">
          <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-9 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex flex-col gap-3.75 flex-1 overflow-auto min-h-0" />
      </div>
    </main>
  );
}

/**
 * Shared layout for deck detail and deck settings routes.
 * Provides the tab navbar (Info, Cards, Stats, Settings) and bottom nav.
 */
export default function DeckLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DeckLayoutFallback />}>
      <DeckLayoutContent params={params}>{children}</DeckLayoutContent>
    </Suspense>
  );
}
