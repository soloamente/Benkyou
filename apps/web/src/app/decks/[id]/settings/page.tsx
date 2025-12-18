import { Skeleton } from "@/components/ui/skeleton";
import { DeckSettingsContent } from "./deck-settings-content";
import { Suspense } from "react";

function DeckSettingsLoading() {
  return (
    <main className="flex flex-col h-full bg-background p-5 gap-3.75 m-5">
      {/* Breadcrumb skeleton - mirrors final layout to avoid CLS */}
      <div className="w-full">
        {/* Keep classes aligned with the real breadcrumb to prevent layout shift when content loads. */}
        <div className="flex w-full gap-2 items-center justify-center font-medium text-lg text-center align-middle">
          <span className="text-title-secondary opacity-40">Decks</span>
          <span className="text-title-secondary opacity-50">/</span>
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
    </main>
  );
}

export default function DeckSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DeckSettingsLoading />}>
      <DeckSettingsContent params={params} />
    </Suspense>
  );
}
