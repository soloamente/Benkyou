"use client";

import { Suspense } from "react";
import { StudyStats } from "@/components/study-stats";
import { DeckStats } from "@/components/deck-stats";
import { StudyHeatmap } from "@/components/study-heatmap";
import { StudySettings } from "@/components/study-settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNavbar } from "@/components/bottom-navbar";

// Extract component that uses useSearchParams to separate component
// useSearchParams() requires Suspense boundary with Cache Components
function StatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(deckId ? `/decks/${deckId}` : "/decks")}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            {deckId ? "Back to Deck" : "Back to Dashboard"}
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            {deckId ? "Deck Statistics" : "Study Statistics"}
          </h1>
          <p className="text-muted-foreground">
            {deckId
              ? "View detailed statistics for this deck"
              : "View your study progress and performance metrics"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Heatmap - shown for both global and deck stats */}
          <StudyHeatmap deckId={deckId || undefined} />

          {deckId ? (
            <>
              <DeckStats deckId={deckId} />
              <StudySettings />
            </>
          ) : (
            <>
              <StudyStats />
              <StudySettings />
            </>
          )}
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}

// Loading fallback for Suspense boundary
function StatsLoading() {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<StatsLoading />}>
      <StatsContent />
    </Suspense>
  );
}
