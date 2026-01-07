"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { authClient } from "@lib/auth-client";
import { cn } from "@lib/utils";
import { Plus, BookOpen, X } from "lucide-react";
import { getDecks, createDeck, type Deck as ApiDeck } from "@/lib/decks-api";
import { getCards } from "@/lib/cards-api";
import { getDueCards, getNewCards, getLearningCards } from "@/lib/study-api";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import type { Subject } from "@/components/navbar";
import { SubjectCombobox } from "@/components/subject-combobox";

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
  const searchParams = useSearchParams();
  const selectedSubject = searchParams.get("subject") || "All";
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckSubject, setDeckSubject] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const createCardRef = useRef<HTMLDivElement>(null);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  // Extract unique subjects from decks for the create deck form
  const availableSubjects = useMemo(() => {
    const uniqueSubjects = new Set<string>();
    decks.forEach((deck) => {
      if (deck.subject) {
        uniqueSubjects.add(deck.subject);
      }
    });
    // Return sorted unique subjects
    return Array.from(uniqueSubjects).sort();
  }, [decks]);

  // Remove initial subject default - let user select manually

  // Filter decks by selected subject
  const filteredDecks = useMemo(() => {
    if (selectedSubject === "All") {
      return decks;
    }
    return decks.filter((deck) => deck.subject === selectedSubject);
  }, [decks, selectedSubject]);

  // Fetch decks on mount
  useEffect(() => {
    loadDecks();
  }, []);

  // Close card when clicking outside
  useEffect(() => {
    if (!isCreateExpanded) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        createCardRef.current &&
        !createCardRef.current.contains(event.target as Node)
      ) {
        handleCancelCreate();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCreateExpanded]);

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

  const handleCreateDeckClick = () => {
    setIsCreateExpanded(true);
  };

  const handleCancelCreate = () => {
    setIsCreateExpanded(false);
    setDeckName("");
    setDeckDescription("");
    setDeckSubject("");
  };

  const handleCreateDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!deckName.trim()) {
      toast.error("Deck name is required");
      return;
    }

    if (deckName.trim().length > 255) {
      toast.error("Deck name must be 255 characters or less");
      return;
    }

    // Subject is required and will always be a valid subject (not "All") since the select excludes "All"

    setIsCreating(true);

    try {
      const newDeck = await createDeck({
        name: deckName.trim(),
        description: deckDescription.trim() || null,
        subject: deckSubject,
      });
      toast.success(`Deck "${newDeck.name}" created successfully`);
      setIsCreateExpanded(false);
      setDeckName("");
      setDeckDescription("");
      setDeckSubject("");
      await handleDeckCreated(newDeck);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create deck. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {isLoadingDecks ? (
        <div className="flex items-center justify-center h-full">
          <Spinner className="size-6" />
        </div>
      ) : filteredDecks.length === 0 ? (
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
          {/* Create Deck Card for Empty State */}
          <motion.div
            ref={createCardRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              height: isCreateExpanded ? 280 : 236,
            }}
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={cn(
              "rounded-[1.25rem] gap-2.5 bg-background p-2.5 overflow-hidden w-[413px] relative",
              !isCreateExpanded && "cursor-pointer hover:border-primary/50"
            )}
          >
            {!isCreateExpanded ? (
              <div className="flex flex-col justify-center items-center w-full h-full">
                <motion.button
                  layoutId="create-deck-button-empty"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateDeckClick}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full leading-none text-title"
                >
                  Create Deck
                </motion.button>
              </div>
            ) : (
              <>
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  onSubmit={handleCreateDeckSubmit}
                  className="flex flex-col h-full gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2 flex-1">
                      <motion.div
                        className="bg-card rounded-xl"
                        animate={{ scale: isNameFocused ? 1.01 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ willChange: "transform" }}
                      >
                        <label id="create-deck-name-label-empty" htmlFor="create-deck-name-empty" className="block">
                          <Input
                            id="create-deck-name-empty"
                            placeholder="Deck name"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            onFocus={() => setIsNameFocused(true)}
                            onBlur={() => setIsNameFocused(false)}
                            disabled={isCreating}
                            autoFocus
                            maxLength={255}
                            className="w-full bg-transparent"
                          />
                        </label>
                      </motion.div>
                      <motion.div
                        className="bg-card rounded-xl"
                        animate={{ scale: isDescriptionFocused ? 1.01 : 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ willChange: "transform" }}
                      >
                        <label id="create-deck-description-label-empty" htmlFor="create-deck-description-empty" className="block">
                          <Input
                            id="create-deck-description-empty"
                            placeholder="Description (optional)"
                            value={deckDescription}
                            onChange={(e) => setDeckDescription(e.target.value)}
                            onFocus={() => setIsDescriptionFocused(true)}
                            onBlur={() => setIsDescriptionFocused(false)}
                            disabled={isCreating}
                            maxLength={255}
                            className="w-full bg-transparent"
                          />
                        </label>
                      </motion.div>
                      <motion.div
                        className="bg-card rounded-xl"
                        transition={{ duration: 0.2 }}
                        style={{ willChange: "transform" }}
                      >
                        <label id="create-deck-subject-label-empty" htmlFor="create-deck-subject-empty" className="block">
                          <SubjectCombobox
                            id="create-deck-subject-empty"
                            value={deckSubject}
                            onChange={setDeckSubject}
                            options={availableSubjects}
                            disabled={isCreating}
                            
                            className="w-full"
                          />
                        </label>
                      </motion.div>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancelCreate}
                      className="ml-4 p-1.5 rounded-full hover:bg-accent transition-colors shrink-0"
                      disabled={isCreating}
                    >
                      <X className="size-4 text-title-secondary" />
                    </motion.button>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <motion.button
                      layoutId="create-deck-button-empty"
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isCreating || !deckName.trim()}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full leading-none text-title disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <Spinner className="size-4" />
                          Creating...
                        </>
                      ) : (
                        "Create Deck"
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              </>
            )}
          </motion.div>
        </div>
      ) : (
        <>
          {/* Gallery Grid */}
          <div className="flex flex-wrap w-full gap-3">
            <AnimatePresence mode="popLayout">
              {filteredDecks.map((deck, index) => (
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
                  <div className="w-[140px] h-full relative flex items-center justify-center rounded-[0.625rem] overflow-hidden shrink-0">
                    {deck.coverImage ? (
                      <Image
                        src={deck.coverImage}
                        alt={deck.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      // Fallback: show deck name on a gradient background
                      <div className="w-full h-full bg-card flex items-center justify-center">
                        <span className="text-lg font-semibold text-[#7c7c7c] truncate px-3">
                          {deck.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-2.5 h-full">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-medium leading-none text-title ">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-[#7c7c7c] text-pretty leading-tight">
                        {deck.description}
                      </p>
                    </div>

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

                      
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Create Deck Card */}
            <motion.div
              ref={createCardRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                height: isCreateExpanded ? 280 : 236,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className={cn(
                "rounded-[1.25rem] gap-2.5 bg-background p-2.5 overflow-hidden w-[413px] relative",
                !isCreateExpanded && "cursor-pointer hover:border-primary/50"
              )}
            >
              {!isCreateExpanded ? (
                <div className="flex flex-col justify-center items-center w-full h-full">
                  <motion.button
                    layoutId="create-deck-button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateDeckClick}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl cursor-pointer leading-none text-title"
                  >
                    Create Deck
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.form
                    onSubmit={handleCreateDeckSubmit}
                    className="flex flex-col h-full gap-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2 flex-1">
                        <motion.div
                          className="bg-card rounded-xl"
                          animate={{ scale: isNameFocused ? 1.01 : 1 }}
                          transition={{ duration: 0.2 }}
                          style={{ willChange: "transform" }}
                        >
                          <label id="create-deck-name-label" htmlFor="create-deck-name" className="block p-0">
                            <Input
                              id="create-deck-name"
                              placeholder="Deck name"
                              value={deckName}
                              onChange={(e) => setDeckName(e.target.value)}
                              onFocus={() => setIsNameFocused(true)}
                              onBlur={() => setIsNameFocused(false)}
                              disabled={isCreating}
                              autoFocus
                              maxLength={255}
                              className="w-full bg-transparent leading-none"
                            />
                          </label>
                        </motion.div>
                        <motion.div
                          className="bg-card rounded-xl"
                          animate={{ scale: isDescriptionFocused ? 1.01 : 1 }}
                          transition={{ duration: 0.2 }}
                          style={{ willChange: "transform" }}
                        >
                          <label id="create-deck-description-label" htmlFor="create-deck-description" className="block">
                            <Input
                              id="create-deck-description"
                              placeholder="Description (optional)"
                              value={deckDescription}
                              onChange={(e) => setDeckDescription(e.target.value)}
                              onFocus={() => setIsDescriptionFocused(true)}
                              onBlur={() => setIsDescriptionFocused(false)}
                              disabled={isCreating}
                              maxLength={255}
                              className="w-full bg-transparent"
                            />
                          </label>
                        </motion.div>
                        <motion.div
                          className="bg-card rounded-xl"
                          transition={{ duration: 0.2 }}
                          style={{ willChange: "transform" }}
                        >
                          <label id="create-deck-subject-label" htmlFor="create-deck-subject" className="block">
                            <SubjectCombobox
                              id="create-deck-subject"
                              value={deckSubject}
                              onChange={setDeckSubject}
                              options={availableSubjects}
                              disabled={isCreating}
                              className="w-full"
                            />
                          </label>
                        </motion.div>
                      </div>
                      {/* <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCancelCreate}
                        className="ml-4 p-1.5 rounded-full hover:bg-accent transition-colors shrink-0"
                        disabled={isCreating}
                      >
                        <X className="size-4 text-title-secondary" />
                      </motion.button> */}
                    </div>
                    <div className="flex justify-end mt-auto">
                      <motion.button
                        layoutId="create-deck-button"
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isCreating || !deckName.trim()}
                        className="bg-primary text-primary-foreground cursor-pointer px-5 py-2.5 rounded-xl leading-none text-title disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
                      >
                        {isCreating ? (
                          <>
                            <Spinner className="size-4" />
                            Creating...
                          </>
                        ) : (
                          "Create Deck"
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
