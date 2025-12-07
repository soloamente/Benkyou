"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type StudyCard,
  reviewCard,
  type ReviewCardRequest,
  getCardPreview,
  type CardPreview,
} from "@/lib/study-api";
import { RotateCcw, HardDrive, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface StudySessionProps {
  cards: StudyCard[];
  sessionId: string;
  deckName?: string | null;
  onCardReviewed: (card: StudyCard) => void;
  onSessionComplete?: () => void;
  onExit?: () => void;
}

export function StudySession({
  cards,
  sessionId,
  deckName,
  onCardReviewed,
  onSessionComplete,
  onExit,
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [preview, setPreview] = useState<CardPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isInitialMount = useRef(true);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Track client-side mount to avoid hydration mismatches
  useEffect(() => {
    setIsMounted(true);
    // After first render, allow animations
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Measure container height for accurate animations
  useEffect(() => {
    if (cardContainerRef.current) {
      const updateHeight = () => {
        if (cardContainerRef.current) {
          setContainerHeight(cardContainerRef.current.offsetHeight);
        }
      };
      updateHeight();
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);

  // Calculate currentCard first, before any useEffects that depend on it
  const currentCard = cards[currentIndex];
  const progress = currentIndex + 1;
  const total = cards.length;
  const nextCard =
    currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

  // Calculate circular progress values
  const circularProgress = useMemo(() => {
    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const progressPercentage = total > 0 ? Math.min(progress / total, 1) : 0;
    const dashOffset = circumference * (1 - progressPercentage);
    return { circumference, dashOffset };
  }, [progress, total]);

  // Load preview for current card
  useEffect(() => {
    if (currentCard && isFlipped) {
      setIsLoadingPreview(true);
      getCardPreview(currentCard.id)
        .then((previewData) => {
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "study-session.tsx:96",
                message: "Preview API response received",
                data: {
                  preview: previewData,
                  previewKeys: previewData?.previews
                    ? Object.keys(previewData.previews)
                    : "no previews",
                  hasPreview1: !!previewData?.previews?.[1],
                  hasPreview3: !!previewData?.previews?.[3],
                  preview3: previewData?.previews?.[3],
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A,B,C,D",
              }),
            }
          ).catch(() => {});
          // #endregion agent log
          setPreview(previewData);
        })
        .catch((error) => {
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "study-session.tsx:100",
                message: "Preview API error",
                data: { error: error?.message || String(error) },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
              }),
            }
          ).catch(() => {});
          // #endregion agent log
          console.warn("Failed to load card preview:", error);
          setPreview(null);
        })
        .finally(() => {
          setIsLoadingPreview(false);
        });
    } else {
      setPreview(null);
    }
  }, [currentCard?.id, isFlipped]);

  // Get next review times from preview
  const nextReviewTimes = useMemo(() => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "study-session.tsx:110",
        message: "Calculating nextReviewTimes",
        data: {
          hasPreview: !!preview,
          hasPreviews: !!preview?.previews,
          previewKeys: preview?.previews ? Object.keys(preview.previews) : null,
          preview3Raw: preview?.previews?.[3],
          preview3DueDate: preview?.previews?.[3]?.dueDate,
          preview3DueDateType: typeof preview?.previews?.[3]?.dueDate,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A,B,C,D",
      }),
    }).catch(() => {});
    // #endregion agent log
    if (!preview || !preview.previews) {
      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "study-session.tsx:112",
            message: "No preview data - returning nulls",
            data: { hasPreview: !!preview, hasPreviews: !!preview?.previews },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "A",
          }),
        }
      ).catch(() => {});
      // #endregion agent log
      return { 1: null, 2: null, 3: null, 4: null };
    }

    // Parse dates from preview - dates come as strings from JSON API
    const parseDate = (
      dateValue: Date | string | null | undefined
    ): Date | null => {
      if (!dateValue) return null;
      // If it's already a Date object, return it
      if (dateValue instanceof Date) return dateValue;
      // If it's a string, parse it
      if (typeof dateValue === "string") {
        const parsed = new Date(dateValue);
        const isValid = !isNaN(parsed.getTime());
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "study-session.tsx:125",
              message: "Parsing date",
              data: {
                dateValue,
                parsed: parsed.toISOString(),
                isValid,
                dateType: typeof dateValue,
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "B",
            }),
          }
        ).catch(() => {});
        // #endregion agent log
        return isValid ? parsed : null;
      }
      return null;
    };

    const result = {
      1: parseDate(preview.previews[1]?.dueDate) || null,
      2: parseDate(preview.previews[2]?.dueDate) || null,
      3: parseDate(preview.previews[3]?.dueDate) || null,
      4: parseDate(preview.previews[4]?.dueDate) || null,
    };
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "study-session.tsx:135",
        message: "nextReviewTimes calculated",
        data: {
          result1: result[1]?.toISOString() || null,
          result2: result[2]?.toISOString() || null,
          result3: result[3]?.toISOString() || null,
          result4: result[4]?.toISOString() || null,
          hasResult3: !!result[3],
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A,B,C,D",
      }),
    }).catch(() => {});
    // #endregion agent log
    return result;
  }, [preview]);

  // Format next review time for display
  const formatNextReview = useCallback((dueDate: Date | null): string => {
    if (!dueDate) return "";

    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    // Use Math.round for days to avoid rounding down due to small timing differences
    // This ensures 4-day intervals show as "4 days" instead of "3 days"
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return "1 day";
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}mo`;
    } else {
      // For longer intervals, show the date
      // Use consistent formatting to avoid hydration issues
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[dueDate.getMonth()];
      const day = dueDate.getDate();
      return `${month} ${day}`;
    }
  }, []);

  // Start timer when card is shown
  useEffect(() => {
    if (currentCard && !isFlipped) {
      setStartTime(Date.now());
      setIsFlipped(false);
    }
  }, [currentIndex, currentCard]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Space to flip card
      if (e.key === " " && !isFlipped && currentCard) {
        e.preventDefault();
        handleFlip();
      }

      // Number keys for ratings (only when flipped)
      if (isFlipped && !isReviewing) {
        if (e.key === "1") {
          e.preventDefault();
          handleRating(1);
        } else if (e.key === "2") {
          e.preventDefault();
          handleRating(2);
        } else if (e.key === "3") {
          e.preventDefault();
          handleRating(3);
        } else if (e.key === "4") {
          e.preventDefault();
          handleRating(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, isReviewing, currentCard]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleRating = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard || isReviewing) {
        return;
      }

      setIsReviewing(true);

      try {
        // Calculate response time
        const responseTime = startTime ? Date.now() - startTime : 0;

        const reviewData: ReviewCardRequest = {
          sessionId,
          rating,
          responseTime,
        };

        const updatedCard = await reviewCard(currentCard.id, reviewData);
        onCardReviewed(updatedCard);

        // Move to next card or complete session
        if (currentIndex < cards.length - 1) {
          // Move to next card - Motion will handle the animation
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
          setStartTime(null);
        } else {
          // All cards reviewed
          if (onSessionComplete) {
            onSessionComplete();
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to review card. Please try again."
        );
      } finally {
        setIsReviewing(false);
      }
    },
    [
      currentCard,
      isReviewing,
      startTime,
      sessionId,
      currentIndex,
      cards.length,
      onCardReviewed,
      onSessionComplete,
    ]
  );

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">No cards to study</p>
          <p className="text-muted-foreground">All cards have been reviewed!</p>
        </div>
      </div>
    );
  }

  // Calculate padding width based on total number of digits
  const getPaddingWidth = (total: number): number => {
    if (total <= 0) return 1;
    return total.toString().length;
  };

  // Format progress number with leading zeros (e.g., "001/200")
  const formatProgress = (num: number, total: number): string => {
    const paddingWidth = getPaddingWidth(total);
    const numStr = num.toString().padStart(paddingWidth, "0");
    const totalStr = total.toString().padStart(paddingWidth, "0");
    return `${numStr}/${totalStr}`;
  };

  // Parse card text to find highlighted portion
  // This looks for patterns like [highlight] or similar markers
  // If no markers found, it will try to intelligently split the text
  const parseCardText = (text: string) => {
    // Check for explicit highlight markers (e.g., [text] or [[text]])
    const bracketMatch = text.match(/\[\[(.+?)\]\]/);
    if (bracketMatch) {
      const highlighted = bracketMatch[1];
      const beforeHighlight = text.substring(0, bracketMatch.index || 0);
      const afterHighlight = text.substring(
        (bracketMatch.index || 0) + bracketMatch[0].length
      );
      return {
        beforeHighlight: beforeHighlight + afterHighlight,
        highlighted,
      };
    }

    // Check for single bracket markers
    const singleBracketMatch = text.match(/\[(.+?)\]/);
    if (singleBracketMatch) {
      const highlighted = singleBracketMatch[1];
      const beforeHighlight = text.substring(0, singleBracketMatch.index || 0);
      const afterHighlight = text.substring(
        (singleBracketMatch.index || 0) + singleBracketMatch[0].length
      );
      return {
        beforeHighlight: beforeHighlight + afterHighlight,
        highlighted,
      };
    }

    // For Japanese text or long sentences, try to split intelligently
    // If text is long, highlight the last portion
    if (text.length > 20) {
      // For Japanese (no spaces), split by character count
      const hasSpaces = text.includes(" ");
      if (!hasSpaces) {
        // Japanese text - split at approximately 60% through
        const splitPoint = Math.floor(text.length * 0.6);
        return {
          beforeHighlight: text.substring(0, splitPoint),
          highlighted: text.substring(splitPoint),
        };
      } else {
        // Text with spaces - split by words
        const words = text.split(/\s+/);
        if (words.length > 2) {
          const highlightStart = Math.floor(words.length * 0.6);
          return {
            beforeHighlight: words.slice(0, highlightStart).join(" "),
            highlighted: words.slice(highlightStart).join(" "),
          };
        }
      }
    }

    // Default: no highlighting
    return { beforeHighlight: text, highlighted: "" };
  };

  const cardText = !isFlipped ? currentCard.front : currentCard.back;
  const parsedText = parseCardText(cardText);

  return (
    <div className="flex flex-col h-full bg-background p-5 gap-3.75">
      {/* Breadcrumb Navigation - centered at top */}
      <div className="flex w-full justify-center">
        <div className="text-lg gap-2 flex items-center font-medium">
          <Link href="/dashboard" className="text-title-secondary">
            Decks
          </Link>
          <span className="text-title-secondary">/</span>
          {deckName ? (
            <span className="text-primary">{deckName}</span>
          ) : (
            <span className="text-title-secondary">All Decks</span>
          )}
        </div>
      </div>

      {/* Main Card Display Area */}
      <div className="flex w-full flex-1 items-center justify-center min-h-0 pt-9">
        <div
          ref={cardContainerRef}
          className="relative w-full h-full max-h-full flex items-center justify-center overflow-visible"
        >
          {/* Card stack - shows current card and next few cards behind it */}
          {/* Cards animate forward when current card is reviewed */}

          {/* Cards behind the current card - animate forward when current changes */}
          {cards.map((card, index) => {
            // Calculate position relative to current card
            const offsetIndex = index - currentIndex;

            // Only show cards that are behind (not current, not past)
            if (offsetIndex <= 0 || offsetIndex > 2) return null;

            // Calculate scale, position, and opacity based on position in stack
            const scale = 1 - offsetIndex * 0.04; // Scale down by 4% per card behind
            const translateY = offsetIndex * -45; // Move down for depth effect
            const opacity = 1 - offsetIndex * 0; // Fade cards behind
            const zIndex = 20 - offsetIndex; // Behind current card

            return (
              <motion.div
                key={`${card.id}-${currentIndex}`}
                animate={{
                  y: translateY,
                  scale: scale,
                  opacity: opacity,
                  transition: {
                    type: "spring",
                    stiffness: 250,
                    damping: 20,
                    mass: 0.5,
                  },
                }}
                style={{
                  willChange: "transform, opacity",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  zIndex: zIndex,
                  pointerEvents: "none",
                }}
              >
                <Card className="border-none w-full h-full bg-card rounded-4xl shadow-[0_-7px_22.5px_0_var(--background)] overflow-hidden">
                  <div className="p-12 h-full flex flex-col justify-center overflow-y-auto">
                    <div className="text-center">
                      <div className="text-4xl md:text-8xl font-medium leading-relaxed whitespace-pre-wrap opacity-70">
                        {card.front}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Current card - exits smoothly when reviewed */}
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentIndex}
                initial={
                  isInitialMount.current
                    ? false
                    : {
                        y: 30,
                        scale: 0.96,
                        opacity: 0.85,
                      }
                }
                animate={{
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 250,
                    damping: 20,
                    mass: 0.5,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: {
                    type: "spring",
                    stiffness: 250,
                    damping: 20,
                    mass: 0.5,
                  },
                }}
                style={{
                  willChange: "transform, opacity",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  zIndex: 20,
                }}
              >
                <Card
                  className="border-none w-full h-full bg-card rounded-4xl shadow-[0_-7px_22.5px_0_var(--background)] overflow-hidden"
                  style={{
                    cursor: !isFlipped ? "pointer" : "default",
                  }}
                  onClick={!isFlipped ? handleFlip : undefined}
                >
                  <div className="p-12 h-full flex flex-col justify-center overflow-y-auto">
                    {!isFlipped ? (
                      // Front side - show card front text
                      <div className="text-center">
                        <div className="text-4xl md:text-8xl font-medium leading-relaxed whitespace-pre-wrap">
                          {parsedText.highlighted ? (
                            <>
                              <span className="text-foreground">
                                {parsedText.beforeHighlight}
                              </span>
                              <span className="text-blue-500 dark:text-blue-400">
                                {parsedText.highlighted}
                              </span>
                            </>
                          ) : (
                            <span className="text-foreground">{cardText}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Back side - show both front and back
                      <div className="text-center space-y-8">
                        <div>
                          <div className="text-2xl md:text-3xl text-muted-foreground/70 mb-4 whitespace-pre-wrap">
                            {currentCard.front}
                          </div>
                        </div>
                        <div className="border-t border-border pt-8">
                          <div className="text-4xl md:text-5xl font-medium leading-relaxed whitespace-pre-wrap">
                            {currentCard.back}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full h-fit flex items-center justify-between">
        {/* Left: Progress indicator */}
        <div className="flex items-center gap-3 flex-1 rounded-full ">
          <div className="bg-card w-fit flex rounded-full py-3 pl-3.75 pr-5 justify-center items-center gap-3.75 leading-none">
            {/* Circular Progress Indicator */}
            <div className="size-6 relative flex items-center justify-center overflow-visible">
              <svg
                className=" -rotate-90"
                viewBox="-1 -1 26 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background circle (dark ring) */}
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-background"
                  fill="none"
                />
                {/* Progress circle (bright white segment) */}
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-primary transition-all duration-300 ease-out"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circularProgress.circumference}
                  strokeDashoffset={circularProgress.dashOffset}
                />
              </svg>
            </div>
            <div className="font-medium gap-2 flex items-center">
              <span className="text-foreground">
                {progress.toString().padStart(getPaddingWidth(total), "0")}
              </span>
              <span className="text-button-inactive-foreground">/</span>
              <span className="text-button-inactive-foreground">
                {total.toString()}
              </span>
            </div>
          </div>
        </div>
        {/* Center: Show Answer button (only when not flipped) or Rating buttons (when flipped) */}
        <div className="flex-1 flex justify-center">
          {!isFlipped ? (
            <button
              onClick={handleFlip}
              className="bg-muted cursor-pointer hover:bg-muted/80 font-medium text-foreground rounded-full px-8 py-3"
            >
              Show Answer
            </button>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-4xl">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleRating(1)}
                      disabled={isReviewing}
                      className="flex-1 bg-card cursor-pointer hover:bg-card/80 font-medium text-primary rounded-full flex items-center justify-center gap-2 px-8 py-3"
                    >
                      Again{" "}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMounted && nextReviewTimes[1] ? (
                      <p>Next review: {formatNextReview(nextReviewTimes[1])}</p>
                    ) : isLoadingPreview ? (
                      <p>Loading...</p>
                    ) : (
                      <p>Again</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleRating(2)}
                      disabled={isReviewing}
                      className="flex-1 bg-card cursor-pointer hover:bg-card/80 font-medium text-primary rounded-full px-8 py-3"
                    >
                      Hard
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMounted && nextReviewTimes[2] ? (
                      <p>Next review: {formatNextReview(nextReviewTimes[2])}</p>
                    ) : isLoadingPreview ? (
                      <p>Loading...</p>
                    ) : (
                      <p>Hard</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleRating(3)}
                      disabled={isReviewing}
                      className="flex-1 bg-card cursor-pointer hover:bg-card/80 font-medium text-primary rounded-full px-8 py-3"
                    >
                      Good
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {(() => {
                      // #region agent log
                      fetch(
                        "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            location: "study-session.tsx:662",
                            message: "Good tooltip render check",
                            data: {
                              isMounted,
                              hasNextReview3: !!nextReviewTimes[3],
                              isLoadingPreview,
                              nextReview3:
                                nextReviewTimes[3]?.toISOString() || null,
                            },
                            timestamp: Date.now(),
                            sessionId: "debug-session",
                            runId: "run1",
                            hypothesisId: "E",
                          }),
                        }
                      ).catch(() => {});
                      // #endregion agent log
                      return isMounted && nextReviewTimes[3] ? (
                        <p>
                          Next review: {formatNextReview(nextReviewTimes[3])}
                        </p>
                      ) : isLoadingPreview ? (
                        <p>Loading...</p>
                      ) : (
                        <p>Good</p>
                      );
                    })()}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleRating(4)}
                      disabled={isReviewing}
                      className="flex-1 bg-card cursor-pointer hover:bg-card/80 font-medium text-primary rounded-full px-8 py-3"
                    >
                      Easy
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMounted && nextReviewTimes[4] ? (
                      <p>Next review: {formatNextReview(nextReviewTimes[4])}</p>
                    ) : isLoadingPreview ? (
                      <p>Loading...</p>
                    ) : (
                      <p>Easy</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        {/* Right: Options button */}
        <div className="flex-1 flex justify-end">
          <button
            className="text-primary font-medium rounded-full bg-card px-8 py-3"
            onClick={() => {
              // Options menu - you can implement a dropdown here
              if (onExit) {
                onExit();
              }
            }}
          >
            Options
          </button>
        </div>
      </div>
    </div>
  );
}
