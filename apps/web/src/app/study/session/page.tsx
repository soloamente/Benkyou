"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StudySession } from "@/components/study-session";
import {
  getDueCards,
  getNewCards,
  getLearningCards,
  startStudySession,
  endStudySession,
  type StudyCard,
  type StudySession as StudySessionType,
} from "@/lib/study-api";
import { getDeck } from "@/lib/decks-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function StudySessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [session, setSession] = useState<StudySessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [deckName, setDeckName] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<{
    cardsStudied: number;
    cardsCorrect: number;
    cardsIncorrect: number;
  } | null>(null);

  useEffect(() => {
    initializeSession();
  }, [deckId]);

  const initializeSession = async () => {
    setIsLoading(true);
    try {
      // Load deck name if deckId is provided
      if (deckId) {
        try {
          const deck = await getDeck(deckId);
          setDeckName(deck.name);
        } catch (error) {
          console.warn("Failed to load deck name:", error);
          setDeckName(null);
        }
      } else {
        setDeckName(null);
      }

      // Load available cards
      const [due, newCards, learning] = await Promise.all([
        getDueCards(deckId || undefined),
        getNewCards(deckId || undefined, 20), // Limit new cards
        getLearningCards(deckId || undefined),
      ]);

      // Combine and prioritize: learning > due > new
      const allCards = [...learning, ...due, ...newCards];

      if (allCards.length === 0) {
        toast.info("No cards available to study");
        router.push("/study");
        return;
      }

      setCards(allCards);

      // Start study session
      const newSession = await startStudySession({
        deckId: deckId || undefined,
      });
      setSession(newSession);
    } catch (error) {
      console.error("Error initializing session:", error);
      toast.error("Failed to start study session");
      router.push("/study");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardReviewed = (updatedCard: StudyCard) => {
    // Update the card in our list
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    // Update session stats
    setSessionStats((prev) => {
      if (!prev) {
        return {
          cardsStudied: 1,
          cardsCorrect: updatedCard.state === "review" ? 1 : 0,
          cardsIncorrect: updatedCard.state === "relearning" ? 1 : 0,
        };
      }
      return {
        cardsStudied: prev.cardsStudied + 1,
        cardsCorrect:
          prev.cardsCorrect + (updatedCard.state === "review" ? 1 : 0),
        cardsIncorrect:
          prev.cardsIncorrect + (updatedCard.state === "relearning" ? 1 : 0),
      };
    });
  };

  const handleSessionComplete = async () => {
    if (!session) return;

    setIsComplete(true);

    try {
      // End the session
      await endStudySession(session.id, {
        cardsStudied: sessionStats?.cardsStudied || 0,
        cardsCorrect: sessionStats?.cardsCorrect || 0,
        cardsIncorrect: sessionStats?.cardsIncorrect || 0,
      });

      toast.success("Study session completed!");
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end study session");
    }
  };

  const handleExit = async () => {
    if (session && !isComplete) {
      try {
        await endStudySession(session.id, {
          cardsStudied: sessionStats?.cardsStudied || 0,
          cardsCorrect: sessionStats?.cardsCorrect || 0,
          cardsIncorrect: sessionStats?.cardsIncorrect || 0,
        });
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
    router.push("/study");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Spinner className="size-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-6 text-green-500" />
              Study Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionStats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-accent/50">
                  <div className="text-2xl font-bold mb-1">
                    {sessionStats.cardsStudied}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cards Studied
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold mb-1 text-green-600">
                    {sessionStats.cardsCorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold mb-1 text-red-600">
                    {sessionStats.cardsIncorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={() => router.push("/study")}
                className="flex-1"
              >
                Study More
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg font-semibold mb-2">No cards to study</p>
              <Button onClick={() => router.push("/study")} className="mt-4">
                <ArrowLeft className="size-4 mr-2" />
                Back to Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <StudySession
        cards={cards}
        sessionId={session.id}
        deckName={deckName}
        onCardReviewed={handleCardReviewed}
        onSessionComplete={handleSessionComplete}
        onExit={handleExit}
      />
    </div>
  );
}
