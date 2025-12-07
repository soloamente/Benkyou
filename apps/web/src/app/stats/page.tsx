"use client";

import { StudyStats } from "@/components/study-stats";
import { DeckStats } from "@/components/deck-stats";
import { StudyHeatmap } from "@/components/study-heatmap";
import { StudySettings } from "@/components/study-settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(deckId ? `/dashboard/decks/${deckId}` : "/dashboard")
          }
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
  );
}


