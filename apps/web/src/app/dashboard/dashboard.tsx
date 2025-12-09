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
import {
  Play,
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getDecks, type Deck as ApiDeck } from "@/lib/decks-api";
import { getCards } from "@/lib/cards-api";
import {
  getDueCards,
  getNewCards,
  getLearningCards,
  getStudyStats,
  type StudyStats as StudyStatsType,
} from "@/lib/study-api";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Temporary types for display - will be enhanced when card system is implemented
interface Deck extends ApiDeck {
  dueCount: number;
  newCount: number;
  learnCount: number;
  totalCards: number;
}

interface StudyStats {
  cardsDue: number;
  newCards: number;
  reviewCards: number;
  studyTimeToday: number; // in minutes
  cardsStudiedToday: number;
  streak: number;
}

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [studyStats, setStudyStats] = useState<StudyStatsType>({
    cardsDue: 0,
    newCards: 0,
    reviewCards: 0,
    learnCount: 0,
    studyTimeToday: 0,
    cardsStudiedToday: 0,
    streak: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch decks and stats on mount
  useEffect(() => {
    loadDecks();
    loadStudyStats();
  }, []);

  const loadDecks = async () => {
    setIsLoadingDecks(true);
    try {
      const fetchedDecks = await getDecks();

      // Validate that fetchedDecks is an array
      if (!Array.isArray(fetchedDecks)) {
        console.error("Expected array but got:", fetchedDecks);
        throw new Error(
          `Invalid response format: expected array, got ${typeof fetchedDecks}`
        );
      }

      // Fetch card counts for each deck
      const decksWithCounts = await Promise.all(
        fetchedDecks.map(async (deck) => {
          try {
            const cards = await getCards(deck.id);
            // Get study counts for this deck
            const [due, newCards, learning] = await Promise.all([
              getDueCards(deck.id).catch(() => []),
              getNewCards(deck.id).catch(() => []),
              getLearningCards(deck.id).catch(() => []),
            ]);
            return {
              ...deck,
              dueCount: due.length,
              newCount: newCards.length,
              learnCount: learning.length,
              totalCards: cards.length,
            };
          } catch (error) {
            console.error(`Error loading cards for deck ${deck.id}:`, error);
            // Return deck with 0 cards if fetch fails
            return {
              ...deck,
              dueCount: 0,
              newCount: 0,
              learnCount: 0,
              totalCards: 0,
            };
          }
        })
      );

      setDecks(decksWithCounts);
    } catch (error) {
      console.error("Error loading decks:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load decks. Please try again."
      );
      // Set empty array on error to prevent further issues
      setDecks([]);
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const loadStudyStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await getStudyStats();
      setStudyStats(stats);
    } catch (error) {
      console.error("Error loading study stats:", error);
      // Don't show error toast for stats, just use defaults
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeckClick = (deckId: string) => {
    router.push(`/dashboard/decks/${deckId}`);
  };

  const handleDeckCreated = async (newDeck: ApiDeck) => {
    // Add the new deck to the list with initial counts
    const displayDeck: Deck = {
      ...newDeck,
      dueCount: 0,
      newCount: 0,
      learnCount: 0,
      totalCards: 0,
    };
    setDecks((prev) => [displayDeck, ...prev]);
    // Reload stats to get updated counts
    await loadStudyStats();
  };

  const totalDue =
    studyStats.cardsDue + studyStats.newCards + studyStats.learnCount;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">Ready to continue your studies?</p>
      </div>

      {/* Study Now Section */}
      <Card className="bg-primary text-primary-foreground border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Study Now</h2>
              <p className="text-primary-foreground/80 mb-4">
                {totalDue > 0
                  ? `You have ${totalDue} card${
                      totalDue === 1 ? "" : "s"
                    } due for review`
                  : "No cards due. Great job!"}
              </p>
              <div className="flex gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium bg-white text-primary hover:bg-white/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  disabled={totalDue === 0}
                  onClick={() => router.push("/study")}
                >
                  <Play className="size-5 mr-2" />
                  {totalDue > 0 ? `Study ${totalDue} Cards` : "No Cards Due"}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                  onClick={() => router.push("/stats")}
                >
                  <BarChart3 className="size-5 mr-2" />
                  View Stats
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-medium border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="size-5 mr-2" />
                  Create Deck
                </button>
              </div>
            </div>
            {totalDue > 0 && (
              <div className="hidden md:flex items-center justify-center size-32 rounded-full border-4 border-primary-foreground/20">
                <span className="text-4xl font-bold">{totalDue}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Due</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Spinner className="size-6" />
              ) : (
                studyStats.cardsDue
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {studyStats.newCards} new, {studyStats.reviewCards} review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Study Time Today
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Spinner className="size-6" />
              ) : (
                `${studyStats.studyTimeToday}m`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {studyStats.cardsStudiedToday} cards studied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Spinner className="size-6" />
              ) : (
                studyStats.streak
              )}
            </div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decks</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks.length}</div>
            <p className="text-xs text-muted-foreground">
              {decks.reduce((acc, deck) => acc + deck.totalCards, 0)} total
              cards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Decks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Decks</CardTitle>
                  <CardDescription>
                    Manage and study your flashcard decks
                  </CardDescription>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="size-4 mr-2" />
                  New Deck
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDecks ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-6" />
                </div>
              ) : decks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No decks yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first deck to start studying
                  </p>
                  <button
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="size-4 mr-2" />
                    Create Your First Deck
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleDeckClick(deck.id)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{deck.name}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{deck.dueCount} due</span>
                          <span>{deck.newCount} new</span>
                          <span>{deck.totalCards} total</span>
                        </div>
                      </div>
                      <button
                        className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeckClick(deck.id);
                        }}
                      >
                        Study
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Tips */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="font-medium mb-1">💡 Daily Practice</p>
                <p className="text-muted-foreground">
                  Study a little every day for better retention than cramming.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="font-medium mb-1">📚 Active Recall</p>
                <p className="text-muted-foreground">
                  Try to recall the answer before flipping the card.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="font-medium mb-1">⏱️ Spaced Repetition</p>
                <p className="text-muted-foreground">
                  Cards will appear more frequently until you master them.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Deck Dialog */}
      <CreateDeckDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleDeckCreated}
      />
    </div>
  );
}
