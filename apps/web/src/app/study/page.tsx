"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDecks, type Deck } from "@/lib/decks-api";
import {
  getDueCards,
  getNewCards,
  getLearningCards,
  type StudyCard,
} from "@/lib/study-api";
import { BookOpen, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function StudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(
    searchParams.get("deckId")
  );
  const [availableCards, setAvailableCards] = useState<{
    due: StudyCard[];
    new: StudyCard[];
    learning: StudyCard[];
  }>({
    due: [],
    new: [],
    learning: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    if (selectedDeckId) {
      loadAvailableCards(selectedDeckId);
    } else {
      loadAvailableCards();
    }
  }, [selectedDeckId]);

  const loadDecks = async () => {
    try {
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
    } catch (error) {
      console.error("Error loading decks:", error);
      toast.error("Failed to load decks");
    }
  };

  const loadAvailableCards = async (deckId?: string) => {
    setIsLoading(true);
    try {
      const [due, newCards, learning] = await Promise.all([
        getDueCards(deckId),
        getNewCards(deckId),
        getLearningCards(deckId),
      ]);

      setAvailableCards({
        due,
        new: newCards,
        learning,
      });
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error("Failed to load available cards");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudy = async () => {
    const totalCards =
      availableCards.due.length +
      availableCards.new.length +
      availableCards.learning.length;

    if (totalCards === 0) {
      toast.info("No cards available to study");
      return;
    }

    setIsStarting(true);
    try {
      // Navigate to study session page with deck ID if selected
      if (selectedDeckId) {
        router.push(`/study/session?deckId=${selectedDeckId}`);
      } else {
        router.push("/study/session");
      }
    } catch (error) {
      console.error("Error starting study session:", error);
      toast.error("Failed to start study session");
      setIsStarting(false);
    }
  };

  const totalCards =
    availableCards.due.length +
    availableCards.new.length +
    availableCards.learning.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Study</h1>
        <p className="text-muted-foreground">
          Choose a deck to study or study all available cards
        </p>
      </div>

      {/* Deck selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Deck</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDeckId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeckId(null)}
            >
              All Decks
            </Button>
            {decks.map((deck) => (
              <Button
                key={deck.id}
                variant={selectedDeckId === deck.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDeckId(deck.id)}
              >
                {deck.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available cards summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">
                  {availableCards.due.length}
                </div>
                <div className="text-sm text-muted-foreground">Due</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">
                  {availableCards.new.length}
                </div>
                <div className="text-sm text-muted-foreground">New</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">
                  {availableCards.learning.length}
                </div>
                <div className="text-sm text-muted-foreground">Learning</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start study button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleStartStudy}
          disabled={isLoading || isStarting || totalCards === 0}
          className="min-w-[200px]"
        >
          {isStarting ? (
            <>
              <Loader2 className="size-5 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="size-5 mr-2" />
              Start Study Session ({totalCards} cards)
            </>
          )}
        </Button>
      </div>

      {totalCards === 0 && !isLoading && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No cards available</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDeckId
                  ? "This deck has no cards due for review."
                  : "You have no cards due for review. Great job!"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


