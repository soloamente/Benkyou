"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, BookOpen, Play, BarChart3 } from "lucide-react";
import { getCards, type Card as ApiCard } from "@/lib/cards-api";
import { type Deck } from "@/lib/decks-api";
import { getDueCards, getNewCards, getLearningCards } from "@/lib/study-api";
import { CreateCardDialog } from "@/components/create-card-dialog";
import { CardList } from "@/components/card-list";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function DeckDetail({
  deck,
  session,
}: {
  deck: Deck;
  session: typeof authClient.$Infer.Session;
}) {
  const router = useRouter();
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [studyCounts, setStudyCounts] = useState({
    due: 0,
    new: 0,
    learning: 0,
  });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Fetch cards and study counts on mount
  useEffect(() => {
    loadCards();
    loadStudyCounts();
  }, [deck.id]);

  const loadCards = async () => {
    setIsLoadingCards(true);
    try {
      const fetchedCards = await getCards(deck.id);
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load cards. Please try again."
      );
      setCards([]);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleCardCreated = (newCard: ApiCard) => {
    // Add the new card to the list
    setCards((prev) => [newCard, ...prev]);
    // Reload study counts
    loadStudyCounts();
  };

  const handleCardUpdated = (updatedCard: ApiCard) => {
    // Update the card in the list
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  };

  const loadStudyCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const [due, newCards, learning] = await Promise.all([
        getDueCards(deck.id).catch(() => []),
        getNewCards(deck.id).catch(() => []),
        getLearningCards(deck.id).catch(() => []),
      ]);
      setStudyCounts({
        due: due.length,
        new: newCards.length,
        learning: learning.length,
      });
    } catch (error) {
      console.error("Error loading study counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const handleCardDeleted = (cardId: string) => {
    // Remove the card from the list
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    // Reload study counts
    loadStudyCounts();
  };

  const handleStudyDeck = () => {
    router.push(`/study?deckId=${deck.id}`);
  };

  const totalStudyCards =
    studyCounts.due + studyCounts.new + studyCounts.learning;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => router.push("/decks")}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground">
              {cards.length} card{cards.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleStudyDeck}
            disabled={totalStudyCards === 0}
          >
            <Play className="size-4 mr-2" />
            Study Deck ({totalStudyCards})
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => router.push(`/stats?deckId=${deck.id}`)}
          >
            <BarChart3 className="size-4 mr-2" />
            View Stats
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="size-4 mr-2" />
            Add Card
          </button>
        </div>
      </div>

      {/* Study Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle>Study Status</CardTitle>
          <CardDescription>
            Cards available for study in this deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCounts ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="size-5" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">{studyCounts.due}</div>
                <div className="text-sm text-muted-foreground">Due</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">{studyCounts.new}</div>
                <div className="text-sm text-muted-foreground">New</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/50">
                <div className="text-2xl font-bold mb-1">
                  {studyCounts.learning}
                </div>
                <div className="text-sm text-muted-foreground">Learning</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                Manage the flashcards in this deck
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCards ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first card to start studying
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="size-4 mr-2" />
                Create Your First Card
              </button>
            </div>
          ) : (
            <CardList
              cards={cards}
              onCardUpdated={handleCardUpdated}
              onCardDeleted={handleCardDeleted}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Card Dialog */}
      <CreateCardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        deckId={deck.id}
        onSuccess={handleCardCreated}
      />
    </div>
  );
}
