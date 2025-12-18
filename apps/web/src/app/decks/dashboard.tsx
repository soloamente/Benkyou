"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@lib/auth-client";
import { cn } from "@lib/utils";
import { Plus, BookOpen } from "lucide-react";
import { getDecks, type Deck as ApiDeck } from "@/lib/decks-api";
import { getCards } from "@/lib/cards-api";
import { getDueCards, getNewCards, getLearningCards } from "@/lib/study-api";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Image from "next/image";

// Temporary types for display - will be enhanced when card system is implemented
// coverImage is now part of ApiDeck from the database
interface Deck extends ApiDeck {
  dueCount: number;
  newCount: number;
  learnCount: number;
  totalCards: number;
}

export default function DecksDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch decks on mount
  useEffect(() => {
    loadDecks();
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

  const handleDeckClick = (deckId: string) => {
    router.push(`/decks/${deckId}`);
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
  };

  return (
    <div className="flex flex-col h-full">
      {isLoadingDecks ? (
        <div className="flex items-center justify-center h-full">
          <Spinner className="size-6" />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <BookOpen className="size-16 text-title-secondary" />
          <div className="flex flex-col space-y-2 text-center">
            <h2 className="text-2xl font-bold leading-none text-title">
              No decks yet
            </h2>
            <p className="text-md text-title-secondary">
              Create your first deck to start studying
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3.75 gap-2 font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
          >
            <Plus />
            Create Your First Deck
          </motion.button>
        </div>
      ) : (
        <>
          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            <AnimatePresence mode="popLayout">
              {decks.map((deck, index) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: index * 0.03,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-[413px] h-[236px] rounded-[1.25rem] gap-2.5 bg-background p-2.5 flex justify-start items-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleDeckClick(deck.id)}
                >
                  {/* Cover image or fallback placeholder with deck name */}
                  <div className="w-[140px] h-full   relative flex items-center justify-center rounded-[0.625rem] overflow-hidden">
                    {deck.coverImage ? (
                      <Image
                        src={deck.coverImage}
                        alt={deck.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      // Fallback: show deck name on a gradient background
                      <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-lg font-semibold text-title truncate px-3">
                          {deck.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-2.5 h-full">
                    <h3 className="text-2xl font-medium leading-none text-title ">
                      {deck.name}
                    </h3>

                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center flex-col ">
                        <span className="text-2xl text-[#4FB4FF]">
                          {deck.newCount}
                        </span>
                        <span className=" text-title text-xs font-normal">
                          New
                        </span>
                      </div>

                      <div className="flex items-center flex-col ">
                        <span className="text-2xl text-[#FF4F4F]">
                          {deck.learnCount}
                        </span>
                        <span className=" text-title text-xs font-normal">
                          Relearn
                        </span>
                      </div>

                      <div className="flex items-center flex-col ">
                        <span className="text-2xl text-[#24CF05]">
                          {deck.dueCount}
                        </span>
                        <span className=" text-title text-xs font-normal">
                          Review
                        </span>
                      </div>

                      {deck.dueCount === 0 &&
                        deck.learnCount === 0 &&
                        deck.newCount === 0 && (
                          <div className="text-xs text-title-secondary">
                            No cards to study
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Create Deck Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: decks.length * 0.03,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="aspect-4/2 rounded-2xl border-2 border-dashed border-border bg-background p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="size-8 rounded-full bg-border flex items-center justify-center">
                  <Plus className="size-4 text-title-secondary" />
                </div>
                <p className="text-xs font-medium text-title-secondary">
                  Create Deck
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Create Deck Dialog */}
      <CreateDeckDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleDeckCreated}
      />
    </div>
  );
}
