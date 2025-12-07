/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 *
 * This package provides a wrapper around the official ts-fsrs library,
 * maintaining backward compatibility with our existing database schema and API.
 */

import {
  type Card as FsrsCard,
  State as FsrsState,
  Rating as FsrsRating,
  FSRS,
  generatorParameters,
  type FSRSParameters,
} from "ts-fsrs";

// Re-export types for backward compatibility
export type CardState = "new" | "learning" | "review" | "relearning";
export type Rating = 1 | 2 | 3 | 4;

export interface CardData {
  state: CardState;
  difficulty: number; // 0-1
  stability: number; // days
  lastReview: Date | null;
  dueDate: Date | null;
  interval: number; // days
  repetitions: number;
  lapses: number;
  elapsedDays: number;
}

export interface StudySettings {
  newCardsPerDay?: number; // Optional for backward compatibility
  maxReviewsPerDay?: number; // Optional for backward compatibility
  learningSteps: number[]; // minutes, e.g., [1, 10]
  graduatingInterval: number; // days
  easyInterval: number; // days
  minimumInterval: number; // days
  maximumInterval: number; // days
  relearningSteps: number[]; // minutes
  fsrsParameters?: unknown | null; // Optional custom FSRS parameters
}

export interface ReviewResult {
  state: CardState;
  difficulty: number;
  stability: number;
  dueDate: Date;
  interval: number;
  repetitions: number;
  lapses: number;
  elapsedDays: number;
}

/**
 * Convert our CardState to ts-fsrs State enum
 */
function cardStateToFsrsState(state: CardState): FsrsState {
  switch (state) {
    case "new":
      return FsrsState.New;
    case "learning":
      return FsrsState.Learning;
    case "review":
      return FsrsState.Review;
    case "relearning":
      return FsrsState.Relearning;
  }
}

/**
 * Convert ts-fsrs State enum to our CardState
 */
function fsrsStateToCardState(state: FsrsState): CardState {
  switch (state) {
    case FsrsState.New:
      return "new";
    case FsrsState.Learning:
      return "learning";
    case FsrsState.Review:
      return "review";
    case FsrsState.Relearning:
      return "relearning";
  }
}

/**
 * Convert our Rating (1-4) to ts-fsrs Rating enum
 */
function ratingToFsrsRating(rating: Rating): FsrsRating {
  switch (rating) {
    case 1:
      return FsrsRating.Again;
    case 2:
      return FsrsRating.Hard;
    case 3:
      return FsrsRating.Good;
    case 4:
      return FsrsRating.Easy;
  }
}

/**
 * Convert database CardData format to ts-fsrs Card format
 */
function dbCardToFsrsCard(card: CardData, now: Date): FsrsCard {
  // Calculate elapsed days from last review or creation (in fractional days for accuracy)
  const elapsedDays = card.lastReview
    ? (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24)
    : card.elapsedDays || 0;

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:118",
      message: "dbCardToFsrsCard calculating elapsed/scheduled",
      data: {
        cardState: card.state,
        hasLastReview: !!card.lastReview,
        elapsedDays,
        cardInterval: card.interval,
        hasDueDate: !!card.dueDate,
        dueDateValue: card.dueDate?.toISOString(),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "B,C",
    }),
  }).catch(() => {});
  // #endregion agent log

  // Calculate scheduled days (interval until next review)
  // For learning/relearning cards, this might be in minutes, so calculate precisely
  let scheduledDays = 0;
  if (card.interval > 0) {
    scheduledDays = card.interval;
  } else if (card.dueDate) {
    const msUntilDue = card.dueDate.getTime() - now.getTime();
    scheduledDays = msUntilDue / (1000 * 60 * 60 * 24); // Convert to fractional days
    // If due date is in the past, set to 0
    if (scheduledDays < 0) {
      scheduledDays = 0;
    }
  }

  return {
    due: card.dueDate || now,
    stability: card.stability || 0,
    difficulty: card.difficulty || 0.3,
    elapsed_days: Math.max(0, elapsedDays),
    scheduled_days: Math.max(0, scheduledDays),
    reps: card.repetitions || 0,
    lapses: card.lapses || 0,
    state: cardStateToFsrsState(card.state),
    last_review: card.lastReview || undefined,
    learning_steps: 0, // Required by Card interface, represents position in learning steps
  };
}

/**
 * Convert ts-fsrs Card format to database CardData format
 */
function fsrsCardToDbCard(
  fsrsCard: FsrsCard,
  now: Date
): Omit<CardData, "lastReview"> {
  const scheduledDays = fsrsCard.scheduled_days || 0;

  // Validate and ensure dueDate is a valid Date object
  let dueDate: Date;
  if (fsrsCard.due instanceof Date && !isNaN(fsrsCard.due.getTime())) {
    dueDate = fsrsCard.due;
  } else if (fsrsCard.due) {
    // Try to convert if it's not a Date but has a value
    const parsed = new Date(fsrsCard.due);
    dueDate = isNaN(parsed.getTime()) ? now : parsed;
  } else {
    // If due is null/undefined, calculate from scheduled_days or stability
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "packages/fsrs/src/index.ts:157",
        message: "Due date is null, calculating fallback",
        data: {
          scheduledDays,
          stability: fsrsCard.stability,
          state: fsrsCard.state,
          hasScheduledDays: scheduledDays > 0,
          hasStability: !!fsrsCard.stability && fsrsCard.stability > 0,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "G",
      }),
    }).catch(() => {});
    // #endregion agent log

    if (scheduledDays > 0) {
      // Calculate due date from scheduled days
      dueDate = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);
    } else if (fsrsCard.stability && fsrsCard.stability > 0) {
      // Calculate due date from stability (in days)
      dueDate = new Date(
        now.getTime() + fsrsCard.stability * 24 * 60 * 60 * 1000
      );
    } else {
      // Last resort: use a small future date (1 minute) to avoid showing "now"
      // This handles cases where the card is graduating but ts-fsrs hasn't set a due date yet
      dueDate = new Date(now.getTime() + 60 * 1000); // 1 minute in future
    }
  }

  // Ensure dueDate is not in the past (at least 1 minute in future)
  if (dueDate.getTime() <= now.getTime()) {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "packages/fsrs/src/index.ts:177",
        message: "Due date is in past, adjusting to future",
        data: {
          originalDueDate: dueDate.toISOString(),
          now: now.toISOString(),
          diffMs: dueDate.getTime() - now.getTime(),
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "G",
      }),
    }).catch(() => {});
    // #endregion agent log
    // Adjust to at least 1 minute in the future
    dueDate = new Date(now.getTime() + 60 * 1000);
  }

  // For learning/relearning states, if due within 24 hours, interval should be 0
  // (handled by learning steps)
  let interval = scheduledDays;
  if (
    (fsrsCard.state === FsrsState.Learning ||
      fsrsCard.state === FsrsState.Relearning) &&
    dueDate
  ) {
    const hoursUntilDue =
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue < 24) {
      interval = 0; // Learning steps handle short intervals
    } else {
      interval = scheduledDays;
    }
  }

  return {
    state: fsrsStateToCardState(fsrsCard.state),
    difficulty: Math.max(0, Math.min(1, fsrsCard.difficulty)), // Clamp to 0-1
    stability: Math.max(0, fsrsCard.stability), // Ensure non-negative
    dueDate: dueDate,
    interval: interval,
    repetitions: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    elapsedDays: 0, // Reset after review
  };
}

/**
 * Create FSRS scheduler instance with user's custom parameters
 */
function createFsrsScheduler(settings: StudySettings): FSRS {
  // Convert numeric learning steps (minutes) to string format with units
  // ts-fsrs expects learning_steps as strings like ["1m", "10m"]
  const learningStepsStrings = settings.learningSteps.map(
    (min) => `${min}m` as const
  );
  const relearningStepsStrings = settings.relearningSteps.map(
    (min) => `${min}m` as const
  );

  // Start with default parameters
  // NOTE: easy_interval and graduating_interval are NOT part of FSRSParameters interface
  // These settings may need to be handled differently or are not supported by ts-fsrs
  const params: Partial<FSRSParameters> = {
    learning_steps: learningStepsStrings as any, // Type assertion needed due to template literal type
    relearning_steps: relearningStepsStrings as any,
    maximum_interval: settings.maximumInterval,
    // easy_interval: settings.easyInterval, // NOT SUPPORTED in FSRSParameters
    // graduating_interval: settings.graduatingInterval, // NOT SUPPORTED in FSRSParameters
    // Enable fuzz for interval randomization (common practice)
    enable_fuzz: true,
  };

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:268",
      message: "Creating FSRS parameters",
      data: {
        hasEasyInterval: !!settings.easyInterval,
        easyInterval: settings.easyInterval,
        hasGraduatingInterval: !!settings.graduatingInterval,
        graduatingInterval: settings.graduatingInterval,
        paramsKeys: Object.keys(params),
        params: params,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "H",
    }),
  }).catch(() => {});
  // #endregion agent log

  // If user has custom FSRS parameters, merge them in
  // Note: custom parameters might override learning_steps, so apply this conversion
  // before merging custom params, or ensure custom params also use string format
  if (settings.fsrsParameters && typeof settings.fsrsParameters === "object") {
    const customParams = settings.fsrsParameters as Partial<FSRSParameters> & {
      learning_steps?: unknown;
      relearning_steps?: unknown;
    };
    // If custom params contain numeric learning_steps, convert them
    if (Array.isArray(customParams.learning_steps)) {
      customParams.learning_steps = customParams.learning_steps.map(
        (step: number | string) =>
          typeof step === "number" ? `${step}m` : step
      ) as any;
    }
    // Same for relearning_steps
    if (Array.isArray(customParams.relearning_steps)) {
      customParams.relearning_steps = customParams.relearning_steps.map(
        (step: number | string) =>
          typeof step === "number" ? `${step}m` : step
      ) as any;
    }
    Object.assign(params, customParams);
  }

  // Generate final parameters with defaults
  const finalParams = generatorParameters(params);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:300",
      message: "After generatorParameters",
      data: {
        finalParamsKeys: Object.keys(finalParams),
        hasEasyInterval: "easy_interval" in finalParams,
        hasGraduatingInterval: "graduating_interval" in finalParams,
        finalParams: finalParams,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "H",
    }),
  }).catch(() => {});
  // #endregion agent log

  return new FSRS(finalParams);
}

/**
 * Calculate the next review based on FSRS algorithm using ts-fsrs
 */
export function reviewCard(
  card: CardData,
  rating: Rating,
  settings: StudySettings,
  now: Date = new Date()
): ReviewResult {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:315",
      message: "reviewCard entry",
      data: {
        cardState: card.state,
        rating,
        cardStability: card.stability,
        cardDifficulty: card.difficulty,
        cardInterval: card.interval,
        cardRepetitions: card.repetitions,
        cardLapses: card.lapses,
        hasLastReview: !!card.lastReview,
        hasDueDate: !!card.dueDate,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A,B,C,D,E",
    }),
  }).catch(() => {});
  // #endregion agent log

  // Create FSRS scheduler with user settings
  const scheduler = createFsrsScheduler(settings);

  // Convert our card format to ts-fsrs format
  const fsrsCard = dbCardToFsrsCard(card, now);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:333",
      message: "After dbCardToFsrsCard",
      data: {
        fsrsCardState: fsrsCard.state,
        fsrsCardStability: fsrsCard.stability,
        fsrsCardDifficulty: fsrsCard.difficulty,
        fsrsCardScheduledDays: fsrsCard.scheduled_days,
        fsrsCardElapsedDays: fsrsCard.elapsed_days,
        fsrsCardReps: fsrsCard.reps,
        fsrsCardLapses: fsrsCard.lapses,
        hasFsrsCardDue: !!fsrsCard.due,
        fsrsCardDueIsDate: fsrsCard.due instanceof Date,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "B,C",
    }),
  }).catch(() => {});
  // #endregion agent log

  // Get scheduling options for all ratings
  const schedulingOptions = scheduler.repeat(fsrsCard, now);

  // Get the result for the chosen rating
  const fsrsRating = ratingToFsrsRating(rating);
  // Type assertion needed because IPreview has specific rating keys
  const schedulingResult = (schedulingOptions as any)[fsrsRating] as {
    card: FsrsCard;
  };

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:244",
      message: "FSRS result before conversion",
      data: {
        rating,
        fsrsRating,
        hasResult: !!schedulingResult,
        resultCard: schedulingResult?.card,
        resultCardDue: schedulingResult?.card?.due,
        resultCardDueType: typeof schedulingResult?.card?.due,
        resultCardDueIsDate: schedulingResult?.card?.due instanceof Date,
        resultCardDueValue: schedulingResult?.card?.due?.toString?.(),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "F",
    }),
  }).catch(() => {});
  // #endregion agent log

  // Convert back to our format
  const newCardData = fsrsCardToDbCard(schedulingResult.card, now);

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:253",
      message: "After fsrsCardToDbCard conversion",
      data: {
        rating,
        dueDate: newCardData.dueDate,
        dueDateType: typeof newCardData.dueDate,
        dueDateIsDate: newCardData.dueDate instanceof Date,
        dueDateValue: newCardData.dueDate?.toString?.(),
        state: newCardData.state,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "F",
    }),
  }).catch(() => {});
  // #endregion agent log

  // Ensure dueDate is never null (fallback to now if somehow null)
  let finalDueDate = newCardData.dueDate || now;
  let finalInterval = newCardData.interval;

  // Override interval for Easy rating if user has set easyInterval
  // Note: ts-fsrs doesn't support easy_interval parameter, so we manually override here
  // OPTION 1: Only override for new/learning cards (before they graduate to review state)
  // This is safer because stability hasn't fully stabilized yet for these cards
  if (rating === 4 && settings.easyInterval) {
    const originalInterval = newCardData.interval;
    const originalDueDate = newCardData.dueDate;
    const isNewOrLearning = card.state === "new" || card.state === "learning";

    if (isNewOrLearning) {
      // Use user's easyInterval setting for new/learning cards
      finalInterval = settings.easyInterval;
      finalDueDate = new Date(
        now.getTime() + settings.easyInterval * 24 * 60 * 60 * 1000
      );

      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "packages/fsrs/src/index.ts:510",
            message:
              "Overriding Easy rating interval with user easyInterval setting (new/learning card)",
            data: {
              rating,
              cardState: card.state,
              newCardState: newCardData.state,
              originalInterval,
              originalDueDate: originalDueDate?.toISOString(),
              userEasyInterval: settings.easyInterval,
              finalInterval,
              finalDueDate: finalDueDate.toISOString(),
              overrideApplied: true,
              reason: "Card is new or learning, stability not yet stabilized",
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "I",
          }),
        }
      ).catch(() => {});
      // #endregion agent log
    } else {
      // For review cards, use FSRS calculated interval (respecting stability)
      // #region agent log
      fetch(
        "http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "packages/fsrs/src/index.ts:546",
            message:
              "Easy rating on review card - using FSRS calculated interval",
            data: {
              rating,
              cardState: card.state,
              newCardState: newCardData.state,
              fsrsInterval: newCardData.interval,
              fsrsDueDate: newCardData.dueDate?.toISOString(),
              userEasyInterval: settings.easyInterval,
              overrideApplied: false,
              reason: "Card is in review state, FSRS stability is stabilized",
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "I",
          }),
        }
      ).catch(() => {});
      // #endregion agent log
    }
  }

  const result: ReviewResult = {
    state: newCardData.state,
    difficulty: newCardData.difficulty,
    stability: newCardData.stability,
    dueDate: finalDueDate,
    interval: finalInterval,
    repetitions: newCardData.repetitions,
    lapses: newCardData.lapses,
    elapsedDays: newCardData.elapsedDays,
  };

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/0ead915a-cb55-4612-83fd-91e767313b65", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "packages/fsrs/src/index.ts:410",
      message: "reviewCard returning result",
      data: {
        rating,
        resultState: result.state,
        resultDifficulty: result.difficulty,
        resultStability: result.stability,
        resultDueDate: result.dueDate.toISOString(),
        resultInterval: result.interval,
        resultRepetitions: result.repetitions,
        resultLapses: result.lapses,
        difficultyInRange: result.difficulty >= 0 && result.difficulty <= 1,
        stabilityNonNegative: result.stability >= 0,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "D,E",
    }),
  }).catch(() => {});
  // #endregion agent log

  return result;
}

/**
 * Get default study settings
 */
export function getDefaultStudySettings(): StudySettings {
  return {
    newCardsPerDay: 20,
    maxReviewsPerDay: 200,
    learningSteps: [1, 10],
    graduatingInterval: 1,
    easyInterval: 4,
    minimumInterval: 1,
    maximumInterval: 36500,
    relearningSteps: [10],
  };
}
