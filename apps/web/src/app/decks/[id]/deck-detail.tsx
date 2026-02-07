"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, BookOpen, Play, ImageIcon, ChevronsUpDown } from "lucide-react";
import { getCards, type Card as ApiCard } from "@/lib/cards-api";
import { type Deck, getDecks, updateDeck, updateDeckCover } from "@/lib/decks-api";
import { getDueCards, getNewCards, getLearningCards } from "@/lib/study-api";
import { CreateCardDialog } from "@/components/create-card-dialog";
import { CardList } from "@/components/card-list";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { SubjectCombobox } from "@components/subject-combobox";
import { AnimatePresence, motion } from "motion/react";
import IconPhoto from "@components/icons/photo";
import { DeckSettingsClient } from "./settings/deck-settings-client";

export default function DeckDetail({
  deck,
  session,
}: {
  deck: Deck;
  session: typeof authClient.$Infer.Session;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "cards";
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [studyCounts, setStudyCounts] = useState({
    due: 0,
    new: 0,
    learning: 0,
  });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Info tab form state (title = deck name, description, subject)
  const [infoTitle, setInfoTitle] = useState(deck.name);
  const [infoDescription, setInfoDescription] = useState(
    deck.description ?? ""
  );
  const [infoSubject, setInfoSubject] = useState(deck.subject ?? "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Max size for cover image (2MB) to keep data URL payload reasonable
  const COVER_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

  // Respect prefers-reduced-motion for the info actions animation
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Unique subjects from all user decks (for SubjectCombobox options)
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Sync form state when deck prop changes (e.g. after save + router.refresh())
  useEffect(() => {
    setInfoTitle(deck.name);
    setInfoDescription(deck.description ?? "");
    setInfoSubject(deck.subject ?? "");
  }, [deck.name, deck.description, deck.subject]);

  // Auto-resize description textarea to fit content
  useEffect(() => {
    const el = descriptionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [infoDescription]);

  // Fetch cards and study counts on mount
  useEffect(() => {
    loadCards();
    loadStudyCounts();
  }, [deck.id]);

  // Load unique subjects from all decks for the subject combobox
  useEffect(() => {
    let cancelled = false;
    getDecks()
      .then((decks) => {
        if (cancelled) return;
        const unique = new Set<string>();
        for (const d of decks) {
          if (d.subject) unique.add(d.subject);
        }
        // Include current deck's subject so it always appears as an option
        if (deck.subject) unique.add(deck.subject);
        setAvailableSubjects(Array.from(unique).sort());
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error loading subjects for combobox:", err);
          setAvailableSubjects(deck.subject ? [deck.subject] : []);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [deck.id, deck.subject]);

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

  const handleInfoCancel = () => {
    setInfoTitle(deck.name);
    setInfoDescription(deck.description ?? "");
    setInfoSubject(deck.subject ?? "");
  };

  const handleInfoSave = async () => {
    setIsSavingInfo(true);
    try {
      await updateDeck(deck.id, {
        name: infoTitle.trim(),
        description: infoDescription.trim() || null,
        subject: infoSubject.trim() || null,
      });
      toast.success("Deck updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update deck"
      );
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (e.g. JPEG, PNG, WebP)");
      e.target.value = "";
      return;
    }
    if (file.size > COVER_IMAGE_MAX_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      e.target.value = "";
      return;
    }

    setIsUploadingCover(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });
      await updateDeckCover(deck.id, dataUrl);
      toast.success("Cover image updated");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update cover image"
      );
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  // Show Cancel/Save only when the user has edited any field (compare trimmed values)
  const hasEdits =
    infoTitle.trim() !== deck.name ||
    infoDescription.trim() !== (deck.description ?? "") ||
    infoSubject.trim() !== (deck.subject ?? "");

  // Info tab: two full-width containers, content centered in each
  const renderInfoTab = () => (
    <div className="flex w-full h-full items-center justify-center">
      {/* Container 1: cover image + Change cover image button, centered */}
      <div className="flex w-full flex-col items-center gap-5">
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-muted aspect-3/4 shrink-0">
          {deck.coverImage ? (
            <Image
              src={deck.coverImage}
              alt={deck.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
              unoptimized={deck.coverImage.startsWith("data:")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm font-medium px-4 text-center">
                {deck.name}
              </span>
            </div>
          )}
        </div>
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          onChange={handleCoverImageChange}
        />
        <button
          type="button"
          disabled={isUploadingCover}
          onClick={() => coverFileInputRef.current?.click()}
          className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-background pr-3.5 pl-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
          aria-label="Change cover image"
        >
          {isUploadingCover ? (
            <Spinner className="size-5 shrink-0" aria-hidden />
          ) : (
            <IconPhoto className="size-5 shrink-0" aria-hidden />
          )}
          {isUploadingCover ? "Updating…" : "Change cover image"}
        </button>
      </div>

      {/* Container 2: form fields, centered */}
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full max-w-md flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <Label className="px-5 py-4 rounded-2xl bg-background text-xs flex flex-col gap-2 items-start justify-start font-medium uppercase tracking-wide">
              <p className="leading-none text-[#7c7c7c] ">Title</p>
              <input
            value={infoTitle}
            onChange={(e) => setInfoTitle(e.target.value)}
            placeholder="Sentence Mining"
            className="w-full text-foreground leading-none text-lg font-normal focus:outline-none focus:ring-0 focus:border-none"
          />
          </Label>
          
        </div>
        <div className="flex flex-col gap-2">
          <Label className="px-5 py-4 rounded-2xl bg-background text-xs flex flex-col gap-2 items-start justify-start font-medium uppercase tracking-wide">
            <p className="leading-none text-[#7c7c7c]">Description</p>
            <textarea
              ref={descriptionTextareaRef}
              value={infoDescription}
              onChange={(e) => setInfoDescription(e.target.value)}
              placeholder="My personal sentence mining deck…"
              rows={2}
              className="w-full p-0! text-foreground ring-0 leading-tight! border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none resize-none overflow-hidden  text-lg font-normal focus:outline-none focus:ring-0 focus:border-none"
            />
          </Label>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="px-5 py-4 rounded-2xl bg-background text-xs flex flex-col gap-2 items-start justify-start font-medium uppercase tracking-wide">
            <p className="leading-none text-[#7c7c7c]">Subject</p>
            <SubjectCombobox
              value={infoSubject}
              onChange={(value) => setInfoSubject(value)}
              options={availableSubjects}
              className="w-full bg-background!"
            />
          </Label>
        </div>
        <AnimatePresence initial={false}>
          {hasEdits && (
            <motion.div
              key="info-actions"
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, height: 0, overflow: "hidden" }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      height: "auto",
                      transition: {
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      },
                    }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0, transition: { duration: 0.1 } }
                  : {
                      opacity: 0,
                      height: 0,
                      transition: {
                        duration: 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      },
                    }
              }
              className="flex w-full gap-3 pt-3"
              style={{ willChange: prefersReducedMotion ? "opacity" : "opacity" }}
            >
              <button
                type="button"
                onClick={handleInfoCancel}
                className="min-h-12 flex-1 rounded-xl border border-input bg-background px-5 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInfoSave}
                disabled={isSavingInfo}
                className="min-h-12 flex-1 rounded-xl bg-primary px-5 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
              >
                {isSavingInfo ? "Saving…" : "Save"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );

  // Cards tab: full card management
  const renderCardsTab = () => (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          onClick={() => router.push("/decks")}
        >
          <ArrowLeft className="size-4 mr-2" aria-hidden />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleStudyDeck}
            disabled={totalStudyCards === 0}
          >
            <Play className="size-4 mr-2" aria-hidden />
            Study Deck ({totalStudyCards})
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="size-4 mr-2" aria-hidden />
            Add Card
          </button>
        </div>
      </div>

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
              <BookOpen
                className="size-12 mx-auto mb-4 text-muted-foreground"
                aria-hidden
              />
              <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first card to start studying
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="size-4 mr-2" aria-hidden />
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
    </>
  );

  // Settings tab: Anki-style deck options
  const renderSettingsTab = () => (
    <div className="flex flex-col h-full overflow-auto">
      <DeckSettingsClient deckId={deck.id} deckName={deck.name} />
    </div>
  );

  const renderTabContent = () => {
    if (currentTab === "info") return renderInfoTab();
    if (currentTab === "settings") return renderSettingsTab();
    return renderCardsTab();
  };

  return (
    <div className="bg-card p-2.5 rounded-3xl gap-2.5 flex flex-col h-full overflow-hidden font-medium mx-auto w-full">
      {renderTabContent()}

      {/* Create Card Dialog - shared across tabs */}
      <CreateCardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        deckId={deck.id}
        onSuccess={handleCardCreated}
      />
    </div>
  );
}
