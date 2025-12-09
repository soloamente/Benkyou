// Load environment variables from the server's .env file
// Since we run from root, we need to explicitly load from apps/server/.env
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), "apps/server/.env") });
// Also try loading from root .env if it exists (for shared variables)
config({ path: resolve(process.cwd(), ".env") });
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@benkyou/auth";
import {
  db,
  deck,
  card,
  note,
  noteType,
  studySession,
  studyRecord,
  userStudySettings,
  user,
  schema,
} from "@benkyou/db";
import { eq, desc, and, lte, gte, or, isNull, sql } from "drizzle-orm";
import {
  reviewCard,
  getDefaultStudySettings,
  type CardData,
  type StudySettings,
  type Rating,
} from "@benkyou/fsrs";

// Get Next.js origin for proxy requests
const nextJsOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
const serverOrigin = process.env.CORS_ORIGIN || "http://localhost:3001";

// Authentication middleware using Better Auth macro pattern
// Uses resolve to check auth and add user to context for route handlers
// If no session, returns 401 status to stop execution
const authMiddleware = new Elysia({ name: "better-auth" }).macro({
  auth: {
    async resolve({ request, status }) {
      try {
        // Debug: Log cookie header to see if it's being received
        const cookieHeader = request.headers.get("cookie");
        console.log(
          "Auth middleware - Cookie header:",
          cookieHeader ? "Present" : "Missing"
        );

        // Get session from Better Auth
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          console.log("Auth middleware - No session found");
          return status(401, { error: "Unauthorized" });
        }

        console.log(
          "Auth middleware - Session found for user:",
          session.user?.id
        );

        // Return auth object to be added to context
        // This will be available as auth.user and auth.session in route handlers
        return {
          auth: {
            user: session.user,
            session: session.session,
          },
        };
      } catch (error) {
        console.error("Auth middleware error:", error);
        return status(500, { error: "Authentication error" });
      }
    },
  },
});

// Deck routes
const deckRoutes = new Elysia({ prefix: "/api/decks" })
  .use(authMiddleware)
  // Create a new deck
  .post(
    "/",
    async ({ body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const newDeck = await db
        .insert(deck)
        .values({
          id: crypto.randomUUID(),
          name: body.name,
          userId: auth.user.id,
        })
        .returning();

      return newDeck[0];
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
      }),
      auth: true,
    }
  )
  // Get all decks for the current user
  .get(
    "/",
    async (context) => {
      try {
        const { auth, set } = context;

        // The auth middleware should handle unauthorized, but add a safety check
        if (!auth?.user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        console.log(`[Decks Route] Fetching decks for user: ${auth.user.id}`);
        const decks = await db
          .select()
          .from(deck)
          .where(eq(deck.userId, auth.user.id))
          .orderBy(desc(deck.createdAt));

        console.log(`[Decks Route] Found ${decks.length} decks`);
        // Ensure we always return an array, even if empty
        return Array.isArray(decks) ? decks : [];
      } catch (error) {
        console.error("[Decks Route] Error fetching decks:", error);
        if (error instanceof Error) {
          console.error("[Decks Route] Error stack:", error.stack);
        }
        const { set } = context;
        set.status = 500;
        return {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      auth: true,
    }
  )
  // Get a single deck by ID
  .get(
    "/:id",
    async ({ params: { id }, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundDeck] = await db.select().from(deck).where(eq(deck.id, id));

      if (!foundDeck) {
        return { error: "Deck not found" };
      }

      // Ensure the deck belongs to the user
      if (foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      return foundDeck;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  )
  // Update a deck
  .put(
    "/:id",
    async ({ params: { id }, body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundDeck] = await db.select().from(deck).where(eq(deck.id, id));

      if (!foundDeck) {
        return { error: "Deck not found" };
      }

      // Ensure the deck belongs to the user
      if (foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      const [updatedDeck] = await db
        .update(deck)
        .set({ name: body.name })
        .where(eq(deck.id, id))
        .returning();

      return updatedDeck;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
      }),
      auth: true,
    }
  )
  // Delete a deck
  .delete(
    "/:id",
    async ({ params: { id }, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundDeck] = await db.select().from(deck).where(eq(deck.id, id));

      if (!foundDeck) {
        return { error: "Deck not found" };
      }

      // Ensure the deck belongs to the user
      if (foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      await db.delete(deck).where(eq(deck.id, id));

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  );

// Card routes
const cardRoutes = new Elysia({ prefix: "/api/cards" })
  .use(authMiddleware)
  // Create a new card (from note)
  .post(
    "/",
    async ({ body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, body.deckId));

      if (!foundDeck) {
        return { error: "Deck not found" };
      }

      if (foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      // Get or create Basic note type for user
      let [basicNoteType] = await db
        .select()
        .from(noteType)
        .where(
          and(eq(noteType.userId, auth.user.id), eq(noteType.name, "Basic"))
        );

      if (!basicNoteType) {
        // Create Basic note type if it doesn't exist
        const noteTypeId = crypto.randomUUID();
        const newNoteType = await db
          .insert(noteType)
          .values({
            id: noteTypeId,
            name: "Basic",
            userId: auth.user.id,
            fields: [
              { name: "Front", type: "text" },
              { name: "Back", type: "text" },
            ],
          })
          .returning();
        basicNoteType = newNoteType[0];
      }

      // Ensure basicNoteType exists (should always be true after the if block above)
      if (!basicNoteType) {
        return { error: "Failed to create or retrieve Basic note type" };
      }

      // Create note from card data
      const noteId = crypto.randomUUID();
      await db.insert(note).values({
        id: noteId,
        deckId: body.deckId,
        noteTypeId: basicNoteType.id,
        fields: {
          Front: body.front,
          Back: body.back,
        },
      });

      // Create card from note with default FSRS values
      const cardId = crypto.randomUUID();
      const newCard = await db
        .insert(card)
        .values({
          id: cardId,
          deckId: body.deckId,
          noteId: noteId,
          front: body.front,
          back: body.back,
          // Default FSRS values for new cards
          state: "new",
          difficulty: 0.3,
          stability: 0,
          interval: 0,
          repetitions: 0,
          lapses: 0,
          elapsedDays: 0,
        })
        .returning();

      return newCard[0];
    },
    {
      body: t.Object({
        deckId: t.String(),
        front: t.String({ minLength: 1 }),
        back: t.String({ minLength: 1 }),
      }),
      auth: true,
    }
  )
  // Get all cards for a deck
  .get(
    "/",
    async ({ query, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      if (!query.deckId) {
        return { error: "deckId query parameter is required" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, query.deckId));

      if (!foundDeck) {
        return { error: "Deck not found" };
      }

      if (foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      // Get all cards for the deck
      const cards = await db
        .select()
        .from(card)
        .where(eq(card.deckId, query.deckId))
        .orderBy(desc(card.createdAt));

      return cards;
    },
    {
      query: t.Object({
        deckId: t.String(),
      }),
      auth: true,
    }
  )
  // Get a single card by ID
  .get(
    "/:id",
    async ({ params: { id }, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundCard] = await db.select().from(card).where(eq(card.id, id));

      if (!foundCard) {
        return { error: "Card not found" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, foundCard.deckId));

      if (!foundDeck || foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      return foundCard;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  )
  // Update a card
  .put(
    "/:id",
    async ({ params: { id }, body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundCard] = await db.select().from(card).where(eq(card.id, id));

      if (!foundCard) {
        return { error: "Card not found" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, foundCard.deckId));

      if (!foundDeck || foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      // Update note if it exists
      if (foundCard.noteId) {
        await db
          .update(note)
          .set({
            fields: {
              Front: body.front,
              Back: body.back,
            },
          })
          .where(eq(note.id, foundCard.noteId));
      }

      // Update card
      const [updatedCard] = await db
        .update(card)
        .set({
          front: body.front,
          back: body.back,
        })
        .where(eq(card.id, id))
        .returning();

      return updatedCard;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        front: t.String({ minLength: 1 }),
        back: t.String({ minLength: 1 }),
      }),
      auth: true,
    }
  )
  // Delete a card
  .delete(
    "/:id",
    async ({ params: { id }, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundCard] = await db.select().from(card).where(eq(card.id, id));

      if (!foundCard) {
        return { error: "Card not found" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, foundCard.deckId));

      if (!foundDeck || foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      // Delete card (note will be deleted via cascade if card.noteId exists)
      await db.delete(card).where(eq(card.id, id));

      // Also delete note if it exists and has no other cards
      if (foundCard.noteId) {
        const remainingCards = await db
          .select()
          .from(card)
          .where(eq(card.noteId, foundCard.noteId));

        if (remainingCards.length === 0) {
          await db.delete(note).where(eq(note.id, foundCard.noteId));
        }
      }

      return { success: true };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  );

// Helper function to get user study settings or create defaults
async function getUserStudySettings(userId: string): Promise<StudySettings> {
  let [settings] = await db
    .select()
    .from(userStudySettings)
    .where(eq(userStudySettings.userId, userId));

  if (!settings) {
    // Create default settings
    const defaultSettings = getDefaultStudySettings();
    const settingsId = crypto.randomUUID();
    await db.insert(userStudySettings).values({
      id: settingsId,
      userId: userId,
      newCardsPerDay: defaultSettings.newCardsPerDay,
      maxReviewsPerDay: defaultSettings.maxReviewsPerDay,
      learningSteps: defaultSettings.learningSteps,
      graduatingInterval: defaultSettings.graduatingInterval,
      easyInterval: defaultSettings.easyInterval,
      minimumInterval: defaultSettings.minimumInterval,
      maximumInterval: defaultSettings.maximumInterval,
      relearningSteps: defaultSettings.relearningSteps,
    });
    return defaultSettings;
  }

  return {
    newCardsPerDay: settings.newCardsPerDay,
    maxReviewsPerDay: settings.maxReviewsPerDay,
    learningSteps: settings.learningSteps as number[],
    graduatingInterval: settings.graduatingInterval,
    easyInterval: settings.easyInterval,
    minimumInterval: settings.minimumInterval,
    maximumInterval: settings.maximumInterval,
    relearningSteps: settings.relearningSteps as number[],
    fsrsParameters: settings.fsrsParameters || null,
  };
}

// Helper function to get cards due for review
async function getDueCards(userId: string, deckId?: string) {
  try {
    const now = new Date();
    const conditions = [
      eq(card.state, "review"),
      lte(card.dueDate, now),
      // Ensure card belongs to user's deck
      sql`EXISTS (
        SELECT 1 FROM ${deck} 
        WHERE ${deck.id} = ${card.deckId} 
        AND ${deck.userId} = ${userId}
      )`,
    ];

    if (deckId) {
      conditions.push(eq(card.deckId, deckId));
    }

    return await db
      .select()
      .from(card)
      .where(and(...conditions))
      .orderBy(card.dueDate);
  } catch (error) {
    console.error("Error in getDueCards:", error);
    // Return empty array on error to prevent cascading failures
    return [];
  }
}

// Helper function to get new cards
async function getNewCards(userId: string, deckId?: string, limit?: number) {
  try {
    const settings = await getUserStudySettings(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count new cards studied today from study records
    // Wrap in try-catch in case study_record table doesn't exist yet
    let studiedCount = 0;
    try {
      // Use date range comparison instead of DATE() function to avoid type issues
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const newCardsStudiedToday = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(studyRecord)
        .innerJoin(studySession, eq(studyRecord.sessionId, studySession.id))
        .where(
          and(
            eq(studySession.userId, userId),
            gte(studyRecord.reviewedAt, todayStart),
            lte(studyRecord.reviewedAt, todayEnd),
            eq(studyRecord.previousState, "new")
          )
        );
      studiedCount = Number(newCardsStudiedToday[0]?.count || 0);
    } catch (error) {
      // If study_record table doesn't exist, assume 0 cards studied today
      console.warn(
        "Could not query study records (table may not exist):",
        error
      );
      studiedCount = 0;
    }

    const remaining = Math.max(
      0,
      (settings.newCardsPerDay || 20) - studiedCount
    );
    const actualLimit = limit ? Math.min(limit, remaining) : remaining;

    if (actualLimit <= 0) {
      return [];
    }

    const conditions = [
      eq(card.state, "new"),
      // Ensure card belongs to user's deck
      sql`EXISTS (
        SELECT 1 FROM ${deck} 
        WHERE ${deck.id} = ${card.deckId} 
        AND ${deck.userId} = ${userId}
      )`,
    ];

    if (deckId) {
      conditions.push(eq(card.deckId, deckId));
    }

    return await db
      .select()
      .from(card)
      .where(and(...conditions))
      .limit(actualLimit)
      .orderBy(card.createdAt);
  } catch (error) {
    console.error("Error in getNewCards:", error);
    // Return empty array on error to prevent cascading failures
    return [];
  }
}

// Helper function to get learning cards
async function getLearningCards(userId: string, deckId?: string) {
  try {
    const now = new Date();
    const conditions = [
      or(eq(card.state, "learning"), eq(card.state, "relearning")),
      or(lte(card.dueDate, now), isNull(card.dueDate)),
      // Ensure card belongs to user's deck
      sql`EXISTS (
        SELECT 1 FROM ${deck} 
        WHERE ${deck.id} = ${card.deckId} 
        AND ${deck.userId} = ${userId}
      )`,
    ];

    if (deckId) {
      conditions.push(eq(card.deckId, deckId));
    }

    return await db
      .select()
      .from(card)
      .where(and(...conditions))
      .orderBy(card.dueDate);
  } catch (error) {
    console.error("Error in getLearningCards:", error);
    // Return empty array on error to prevent cascading failures
    return [];
  }
}

// Study routes
const studyRoutes = new Elysia({ prefix: "/api/study" })
  .use(authMiddleware)
  // Debug: Log all requests to study routes
  .onBeforeHandle(({ request }) => {
    console.log(`[Study Routes] ${request.method} ${request.url}`);
  })
  // Get cards due for review
  .get(
    "/cards/due",
    async ({ query, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const cards = await getDueCards(
        auth.user.id,
        query.deckId as string | undefined
      );
      return cards;
    },
    {
      query: t.Object({
        deckId: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // Get new cards available for study
  .get(
    "/cards/new",
    async ({ query, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const cards = await getNewCards(
        auth.user.id,
        query.deckId as string | undefined,
        query.limit ? Number(query.limit) : undefined
      );
      return cards;
    },
    {
      query: t.Object({
        deckId: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // Get cards in learning state
  .get(
    "/cards/learning",
    async ({ query, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const cards = await getLearningCards(
        auth.user.id,
        query.deckId as string | undefined
      );
      return cards;
    },
    {
      query: t.Object({
        deckId: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // Start a new study session
  .post(
    "/sessions",
    async ({ body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      // Verify deck belongs to user if deckId is provided
      if (body.deckId) {
        const [foundDeck] = await db
          .select()
          .from(deck)
          .where(eq(deck.id, body.deckId));

        if (!foundDeck || foundDeck.userId !== auth.user.id) {
          return { error: "Deck not found or unauthorized" };
        }
      }

      const sessionId = crypto.randomUUID();
      const [newSession] = await db
        .insert(studySession)
        .values({
          id: sessionId,
          userId: auth.user.id,
          deckId: body.deckId || null,
          startedAt: new Date(),
        })
        .returning();

      return newSession;
    },
    {
      body: t.Object({
        deckId: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // End a study session
  .post(
    "/sessions/:id/end",
    async ({ params: { id }, body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundSession] = await db
        .select()
        .from(studySession)
        .where(eq(studySession.id, id));

      if (!foundSession) {
        return { error: "Session not found" };
      }

      if (foundSession.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      if (foundSession.endedAt) {
        return { error: "Session already ended" };
      }

      const now = new Date();
      const duration = Math.round(
        (now.getTime() - foundSession.startedAt.getTime()) / (1000 * 60)
      );

      const [updatedSession] = await db
        .update(studySession)
        .set({
          endedAt: now,
          duration: duration,
          cardsStudied: body.cardsStudied || foundSession.cardsStudied,
          cardsCorrect: body.cardsCorrect || foundSession.cardsCorrect,
          cardsIncorrect: body.cardsIncorrect || foundSession.cardsIncorrect,
        })
        .where(eq(studySession.id, id))
        .returning();

      return updatedSession;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        cardsStudied: t.Optional(t.Number()),
        cardsCorrect: t.Optional(t.Number()),
        cardsIncorrect: t.Optional(t.Number()),
      }),
      auth: true,
    }
  )
  // Get preview of next review times for a card (for UI display)
  .get(
    "/cards/:id/preview",
    async ({ params: { id }, auth, set }) => {
      try {
        if (!auth?.user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        // Get card
        const [foundCard] = await db.select().from(card).where(eq(card.id, id));

        if (!foundCard) {
          set.status = 404;
          return { error: "Card not found" };
        }

        // Verify card belongs to user
        const [foundDeck] = await db
          .select()
          .from(deck)
          .where(eq(deck.id, foundCard.deckId));

        if (!foundDeck || foundDeck.userId !== auth.user.id) {
          set.status = 403;
          return { error: "Unauthorized" };
        }

        // Get user study settings
        const settings = await getUserStudySettings(auth.user.id);

        // Prepare card data for FSRS
        const cardData: CardData = {
          state: foundCard.state as CardData["state"],
          difficulty: foundCard.difficulty || 0.3,
          stability: foundCard.stability || 0,
          lastReview: foundCard.lastReview || null,
          dueDate: foundCard.dueDate || null,
          interval: foundCard.interval || 0,
          repetitions: foundCard.repetitions || 0,
          lapses: foundCard.lapses || 0,
          elapsedDays: foundCard.elapsedDays || 0,
        };

        // Calculate preview for each rating
        const now = new Date();
        const previews: Record<number, { dueDate: Date; interval: number }> =
          {};

        for (const rating of [1, 2, 3, 4] as Rating[]) {
          try {
            const result = reviewCard(cardData, rating, settings, now);

            // Validate dueDate before using it
            let validDueDate = result.dueDate;
            if (
              !(validDueDate instanceof Date) ||
              isNaN(validDueDate.getTime())
            ) {
              // If invalid, use current time as fallback
              validDueDate = now;
            }

            previews[rating] = {
              dueDate: validDueDate,
              interval: result.interval,
            };
          } catch (error) {
            console.warn(
              `Failed to calculate preview for rating ${rating}:`,
              error
            );
          }
        }

        return { previews };
      } catch (error) {
        console.error("Error calculating card preview:", error);
        set.status = 500;
        return {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      auth: true,
    }
  )
  // Submit a card review
  .post(
    "/cards/:id/review",
    async ({ params: { id }, body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const [foundCard] = await db.select().from(card).where(eq(card.id, id));

      if (!foundCard) {
        return { error: "Card not found" };
      }

      // Verify deck belongs to user
      const [foundDeck] = await db
        .select()
        .from(deck)
        .where(eq(deck.id, foundCard.deckId));

      if (!foundDeck || foundDeck.userId !== auth.user.id) {
        return { error: "Unauthorized" };
      }

      // Verify session belongs to user
      const [foundSession] = await db
        .select()
        .from(studySession)
        .where(eq(studySession.id, body.sessionId));

      if (!foundSession || foundSession.userId !== auth.user.id) {
        return { error: "Session not found or unauthorized" };
      }

      // Get user study settings
      const settings = await getUserStudySettings(auth.user.id);

      // Prepare card data for FSRS
      const cardData: CardData = {
        state: foundCard.state as CardData["state"],
        difficulty: foundCard.difficulty || 0.3,
        stability: foundCard.stability || 0,
        lastReview: foundCard.lastReview || null,
        dueDate: foundCard.dueDate || null,
        interval: foundCard.interval || 0,
        repetitions: foundCard.repetitions || 0,
        lapses: foundCard.lapses || 0,
        elapsedDays: foundCard.elapsedDays || 0,
      };

      // Calculate new card state using FSRS
      const now = new Date();
      const result = reviewCard(cardData, body.rating as Rating, settings, now);

      // Update card with new state
      const [updatedCard] = await db
        .update(card)
        .set({
          state: result.state,
          difficulty: result.difficulty,
          stability: result.stability,
          lastReview: now,
          dueDate: result.dueDate,
          interval: result.interval,
          repetitions: result.repetitions,
          lapses: result.lapses,
          elapsedDays: result.elapsedDays,
        })
        .where(eq(card.id, id))
        .returning();

      // Create study record
      const recordId = crypto.randomUUID();
      await db.insert(studyRecord).values({
        id: recordId,
        cardId: id,
        sessionId: body.sessionId,
        rating: body.rating,
        reviewedAt: now,
        responseTime: body.responseTime || 0,
        previousState: cardData.state,
        newState: result.state,
        previousDifficulty: cardData.difficulty,
        newDifficulty: result.difficulty,
        previousStability: cardData.stability,
        newStability: result.stability,
      });

      // Update session stats
      const isCorrect = body.rating >= 3;
      await db
        .update(studySession)
        .set({
          cardsStudied: sql`${studySession.cardsStudied} + 1`,
          cardsCorrect: isCorrect
            ? sql`${studySession.cardsCorrect} + 1`
            : studySession.cardsCorrect,
          cardsIncorrect: !isCorrect
            ? sql`${studySession.cardsIncorrect} + 1`
            : studySession.cardsIncorrect,
        })
        .where(eq(studySession.id, body.sessionId));

      return updatedCard;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        sessionId: t.String(),
        rating: t.Number({ minimum: 1, maximum: 4 }),
        responseTime: t.Optional(t.Number()),
      }),
      auth: true,
    }
  )
  // Get study statistics
  .get(
    "/stats",
    async ({ auth, set, request }) => {
      console.log(`[Stats Route] GET /api/study/stats - auth:`, !!auth?.user);
      try {
        if (!auth?.user) {
          console.log(`[Stats Route] No auth user, returning 401`);
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get cards due count
        const dueCards = await getDueCards(auth.user.id);
        const dueCount = dueCards.length;

        // Get new cards count
        const newCards = await getNewCards(auth.user.id);
        const newCount = newCards.length;

        // Get learning cards count
        const learningCards = await getLearningCards(auth.user.id);
        const learnCount = learningCards.length;

        // Get today's study stats
        // Wrap in try-catch in case study_session table doesn't exist yet
        let cardsStudiedToday = 0;
        let studyTimeToday = 0;
        let streak = 0;

        try {
          // Create date range for today
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);

          const todaySessions = await db
            .select()
            .from(studySession)
            .where(
              and(
                eq(studySession.userId, auth.user.id),
                // Use date range comparison instead of DATE() function
                gte(studySession.startedAt, todayStart),
                lte(studySession.startedAt, todayEnd)
              )
            );

          cardsStudiedToday = todaySessions.reduce(
            (sum, session) => sum + session.cardsStudied,
            0
          );
          studyTimeToday = todaySessions.reduce(
            (sum, session) => sum + session.duration,
            0
          );

          // Calculate streak (simplified - check last 30 days)
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dayStart = new Date(checkDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(checkDate);
            dayEnd.setHours(23, 59, 59, 999);

            const daySessions = await db
              .select()
              .from(studySession)
              .where(
                and(
                  eq(studySession.userId, auth.user.id),
                  gte(studySession.startedAt, dayStart),
                  lte(studySession.startedAt, dayEnd),
                  sql`${studySession.cardsStudied} > 0`
                )
              );
            if (daySessions.length > 0) {
              streak++;
            } else if (i > 0) {
              // Break streak if we find a day with no study (except today)
              break;
            }
          }
        } catch (error) {
          // If study_session table doesn't exist, return zeros
          console.warn(
            "Could not query study sessions (table may not exist):",
            error
          );
          cardsStudiedToday = 0;
          studyTimeToday = 0;
          streak = 0;
        }

        return {
          cardsDue: dueCount,
          newCards: newCount,
          reviewCards: dueCount,
          learnCount: learnCount,
          studyTimeToday: studyTimeToday,
          cardsStudiedToday: cardsStudiedToday,
          streak: streak,
        };
      } catch (error) {
        console.error("Error fetching study stats:", error);
        set.status = 500;
        return {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      auth: true,
    }
  )
  // Get daily statistics
  .get(
    "/stats/daily",
    async ({ query, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      const date = query.date ? new Date(query.date) : new Date();
      date.setHours(0, 0, 0, 0);

      // Create date range for the specified date
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const sessions = await db
        .select()
        .from(studySession)
        .where(
          and(
            eq(studySession.userId, auth.user.id),
            gte(studySession.startedAt, dateStart),
            lte(studySession.startedAt, dateEnd)
          )
        );

      return {
        date: date.toISOString(),
        sessions: sessions.length,
        cardsStudied: sessions.reduce((sum, s) => sum + s.cardsStudied, 0),
        cardsCorrect: sessions.reduce((sum, s) => sum + s.cardsCorrect, 0),
        cardsIncorrect: sessions.reduce((sum, s) => sum + s.cardsIncorrect, 0),
        studyTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      };
    },
    {
      query: t.Object({
        date: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // Get deck-specific statistics
  .get(
    "/stats/deck/:deckId",
    async ({ params: { deckId }, auth, set }) => {
      try {
        if (!auth?.user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        // Verify deck belongs to user
        const [foundDeck] = await db
          .select()
          .from(deck)
          .where(eq(deck.id, deckId));

        if (!foundDeck || foundDeck.userId !== auth.user.id) {
          set.status = 404;
          return { error: "Deck not found" };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get deck-specific card counts (available for study)
        const dueCards = await getDueCards(auth.user.id, deckId);
        const newCards = await getNewCards(auth.user.id, deckId);
        const learningCards = await getLearningCards(auth.user.id, deckId);

        // Get total counts by state (regardless of due dates or daily limits)
        // This shows the actual state distribution of all cards in the deck
        const allCardsInDeck = await db
          .select({
            state: card.state,
            dueDate: card.dueDate,
          })
          .from(card)
          .where(eq(card.deckId, deckId));

        // Count cards by state
        const stateCounts = {
          new: allCardsInDeck.filter((c) => c.state === "new").length,
          learning: allCardsInDeck.filter(
            (c) => c.state === "learning" || c.state === "relearning"
          ).length,
          review: allCardsInDeck.filter((c) => c.state === "review").length,
          total: allCardsInDeck.length,
        };

        // Count available cards (those that can be studied now)
        const now = new Date();
        const availableCounts = {
          new: newCards.length, // Already respects daily limit
          learning: learningCards.length, // Already filtered by due date
          due: dueCards.length, // Already filtered by due date
          total: newCards.length + learningCards.length + dueCards.length,
        };

        // Get deck-specific study sessions
        const deckSessions = await db
          .select()
          .from(studySession)
          .where(
            and(
              eq(studySession.userId, auth.user.id),
              eq(studySession.deckId, deckId)
            )
          )
          .orderBy(desc(studySession.startedAt))
          .limit(30); // Last 30 sessions

        // Calculate totals
        const totalCardsStudied = deckSessions.reduce(
          (sum, s) => sum + s.cardsStudied,
          0
        );
        const totalCardsCorrect = deckSessions.reduce(
          (sum, s) => sum + s.cardsCorrect,
          0
        );
        const totalCardsIncorrect = deckSessions.reduce(
          (sum, s) => sum + s.cardsIncorrect,
          0
        );
        const totalStudyTime = deckSessions.reduce(
          (sum, s) => sum + s.duration,
          0
        );

        // Today's stats for this deck
        const todaySessions = deckSessions.filter(
          (s) =>
            s.startedAt &&
            new Date(s.startedAt).toDateString() === today.toDateString()
        );

        const todayCardsStudied = todaySessions.reduce(
          (sum, s) => sum + s.cardsStudied,
          0
        );
        const todayCardsCorrect = todaySessions.reduce(
          (sum, s) => sum + s.cardsCorrect,
          0
        );
        const todayCardsIncorrect = todaySessions.reduce(
          (sum, s) => sum + s.cardsIncorrect,
          0
        );
        const todayStudyTime = todaySessions.reduce(
          (sum, s) => sum + s.duration,
          0
        );

        // Calculate retention rate
        const retentionRate =
          totalCardsStudied > 0
            ? Math.round((totalCardsCorrect / totalCardsStudied) * 100)
            : 0;

        return {
          deckId,
          deckName: foundDeck.name,
          // Available cards (can be studied now)
          cardCounts: {
            due: dueCards.length,
            new: newCards.length,
            learning: learningCards.length,
            total: availableCounts.total,
          },
          // Total cards by state (all cards in deck)
          stateCounts: {
            new: stateCounts.new,
            learning: stateCounts.learning,
            review: stateCounts.review,
            total: stateCounts.total,
          },
          overall: {
            sessions: deckSessions.length,
            cardsStudied: totalCardsStudied,
            cardsCorrect: totalCardsCorrect,
            cardsIncorrect: totalCardsIncorrect,
            studyTime: totalStudyTime, // minutes
            retentionRate,
          },
          today: {
            sessions: todaySessions.length,
            cardsStudied: todayCardsStudied,
            cardsCorrect: todayCardsCorrect,
            cardsIncorrect: todayCardsIncorrect,
            studyTime: todayStudyTime, // minutes
            retentionRate:
              todayCardsStudied > 0
                ? Math.round((todayCardsCorrect / todayCardsStudied) * 100)
                : 0,
          },
          recentSessions: deckSessions.slice(0, 10).map((s) => ({
            id: s.id,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            cardsStudied: s.cardsStudied,
            cardsCorrect: s.cardsCorrect,
            cardsIncorrect: s.cardsIncorrect,
            duration: s.duration,
          })),
        };
      } catch (error) {
        console.error("Error fetching deck stats:", error);
        set.status = 500;
        return {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      params: t.Object({
        deckId: t.String(),
      }),
      auth: true,
    }
  )
  // Get heatmap data (daily activity for a date range)
  .get(
    "/stats/heatmap",
    async ({ query, auth, set }) => {
      try {
        if (!auth?.user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const startDate = query.startDate
          ? new Date(query.startDate)
          : new Date();
        const endDate = query.endDate ? new Date(query.endDate) : new Date();
        const deckId = query.deckId as string | undefined;

        // Set time to start/end of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Get all study sessions in the date range
        // Use gte/lte operators instead of sql template to properly serialize Date objects
        const conditions = [
          eq(studySession.userId, auth.user.id),
          gte(studySession.startedAt, startDate),
          lte(studySession.startedAt, endDate),
        ];

        if (deckId) {
          conditions.push(eq(studySession.deckId, deckId));
        }

        const sessions = await db
          .select()
          .from(studySession)
          .where(and(...conditions));

        // Group sessions by date and calculate daily stats
        const dailyData: Record<
          string,
          {
            date: string;
            cardsStudied: number;
            cardsDue: number;
            sessions: number;
          }
        > = {};

        // Process sessions
        // Convert session dates to local date strings to match user's timezone
        for (const session of sessions) {
          // Parse the session date (could be UTC from database)
          const sessionDate = new Date(session.startedAt);
          // Get the date components in the user's local timezone
          const year = sessionDate.getFullYear();
          const month = String(sessionDate.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
          const day = String(sessionDate.getDate()).padStart(2, "0");
          // Create date key in YYYY-MM-DD format using local timezone
          const dateKey = `${year}-${month}-${day}`;

          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              date: dateKey,
              cardsStudied: 0,
              cardsDue: 0,
              sessions: 0,
            };
          }

          dailyData[dateKey].cardsStudied += session.cardsStudied;
          dailyData[dateKey].sessions += 1;
        }

        // Get all cards once (more efficient than querying per day)
        // We'll get cards that might be due in the range
        const now = new Date();
        const cardConditions = [
          // Ensure card belongs to user's deck
          sql`EXISTS (
            SELECT 1 FROM ${deck} 
            WHERE ${deck.id} = ${card.deckId} 
            AND ${deck.userId} = ${auth.user.id}
          )`,
        ];

        if (deckId) {
          cardConditions.push(eq(card.deckId, deckId));
        }

        const allCards = await db
          .select()
          .from(card)
          .where(and(...cardConditions));

        // Group cards by due date (using local timezone)
        const cardsByDueDate = new Map<string, number>();
        for (const card of allCards) {
          if (card.dueDate) {
            const dueDate = new Date(card.dueDate);
            // Get date components in local timezone
            const year = dueDate.getFullYear();
            const month = String(dueDate.getMonth() + 1).padStart(2, "0");
            const day = String(dueDate.getDate()).padStart(2, "0");
            const dateKey = `${year}-${month}-${day}`;
            cardsByDueDate.set(dateKey, (cardsByDueDate.get(dateKey) || 0) + 1);
          } else if (card.state === "new" || card.state === "learning") {
            // Cards without due date that are new/learning are "due" today
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const todayKey = `${year}-${month}-${day}`;
            cardsByDueDate.set(
              todayKey,
              (cardsByDueDate.get(todayKey) || 0) + 1
            );
          }
        }

        // Initialize all days in the range and set cards due
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();
        const todayLocal = new Date(todayYear, todayMonth, todayDay);
        const todayKey = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}-${String(todayDay).padStart(2, "0")}`;

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          // Get date key in local timezone
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const day = currentDate.getDate();
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              date: dateKey,
              cardsStudied: 0,
              cardsDue: 0,
              sessions: 0,
            };
          }

          // For today and future dates, show cards due
          // For past dates, cards due is already 0 (we only track what was studied)
          const checkDate = new Date(year, month, day);
          if (checkDate >= todayLocal) {
            dailyData[dateKey].cardsDue = cardsByDueDate.get(dateKey) || 0;
          }

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Convert to array and sort by date
        const heatmapData = Object.values(dailyData).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate summary statistics
        const totalDays =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        const daysWithActivity = heatmapData.filter(
          (d) => d.cardsStudied > 0
        ).length;
        const totalCardsStudied = heatmapData.reduce(
          (sum, d) => sum + d.cardsStudied,
          0
        );
        const dailyAverage =
          daysWithActivity > 0
            ? Math.round(totalCardsStudied / daysWithActivity)
            : 0;
        const daysLearnedPercent = Math.round(
          (daysWithActivity / totalDays) * 100
        );

        // Calculate streaks
        let longestStreak = 0;
        let currentStreak = 0;
        let tempStreak = 0;

        // Sort dates in reverse to check from today backwards
        const sortedDates = [...heatmapData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        for (const day of sortedDates) {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);

          if (day.cardsStudied > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);

            // Check if this is today or yesterday for current streak
            const daysDiff = Math.floor(
              (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff <= 1 && currentStreak === 0) {
              // Start counting current streak
              currentStreak = tempStreak;
            } else if (daysDiff > 1 && currentStreak > 0) {
              // Streak broken
              break;
            }
          } else {
            tempStreak = 0;
            if (dayDate < today) {
              // Past day with no activity breaks current streak
              if (currentStreak > 0) {
                break;
              }
            }
          }
        }

        return {
          data: heatmapData,
          summary: {
            dailyAverage,
            daysLearned: daysLearnedPercent,
            longestStreak,
            currentStreak,
            totalDays,
            daysWithActivity,
          },
        };
      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        set.status = 500;
        return {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      query: t.Object({
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        deckId: t.Optional(t.String()),
      }),
      auth: true,
    }
  )
  // Get user study settings
  .get(
    "/settings",
    async ({ auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      let [settings] = await db
        .select()
        .from(userStudySettings)
        .where(eq(userStudySettings.userId, auth.user.id));

      if (!settings) {
        // Create default settings
        const defaultSettings = getDefaultStudySettings();
        const settingsId = crypto.randomUUID();
        const [newSettings] = await db
          .insert(userStudySettings)
          .values({
            id: settingsId,
            userId: auth.user.id,
            newCardsPerDay: defaultSettings.newCardsPerDay,
            maxReviewsPerDay: defaultSettings.maxReviewsPerDay,
            learningSteps: defaultSettings.learningSteps,
            graduatingInterval: defaultSettings.graduatingInterval,
            easyInterval: defaultSettings.easyInterval,
            minimumInterval: defaultSettings.minimumInterval,
            maximumInterval: defaultSettings.maximumInterval,
            relearningSteps: defaultSettings.relearningSteps,
          })
          .returning();
        return newSettings;
      }

      return settings;
    },
    {
      auth: true,
    }
  )
  // Update user study settings
  .put(
    "/settings",
    async ({ body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      let [settings] = await db
        .select()
        .from(userStudySettings)
        .where(eq(userStudySettings.userId, auth.user.id));

      if (!settings) {
        // Create settings if they don't exist
        const settingsId = crypto.randomUUID();
        const [newSettings] = await db
          .insert(userStudySettings)
          .values({
            id: settingsId,
            userId: auth.user.id,
            newCardsPerDay: body.newCardsPerDay ?? 20,
            maxReviewsPerDay: body.maxReviewsPerDay ?? 200,
            learningSteps: body.learningSteps ?? [1, 10],
            graduatingInterval: body.graduatingInterval ?? 1,
            easyInterval: body.easyInterval ?? 4,
            minimumInterval: body.minimumInterval ?? 1,
            maximumInterval: body.maximumInterval ?? 36500,
            relearningSteps: body.relearningSteps ?? [10],
            fsrsParameters: body.fsrsParameters || null,
          })
          .returning();
        return newSettings;
      }

      // Update existing settings
      const [updatedSettings] = await db
        .update(userStudySettings)
        .set({
          newCardsPerDay: body.newCardsPerDay ?? settings.newCardsPerDay,
          maxReviewsPerDay: body.maxReviewsPerDay ?? settings.maxReviewsPerDay,
          learningSteps: body.learningSteps ?? settings.learningSteps,
          graduatingInterval:
            body.graduatingInterval ?? settings.graduatingInterval,
          easyInterval: body.easyInterval ?? settings.easyInterval,
          minimumInterval: body.minimumInterval ?? settings.minimumInterval,
          maximumInterval: body.maximumInterval ?? settings.maximumInterval,
          relearningSteps: body.relearningSteps ?? settings.relearningSteps,
          fsrsParameters: body.fsrsParameters ?? settings.fsrsParameters,
        })
        .where(eq(userStudySettings.userId, auth.user.id))
        .returning();

      return updatedSettings;
    },
    {
      body: t.Object({
        newCardsPerDay: t.Optional(t.Number()),
        maxReviewsPerDay: t.Optional(t.Number()),
        learningSteps: t.Optional(t.Array(t.Number())),
        graduatingInterval: t.Optional(t.Number()),
        easyInterval: t.Optional(t.Number()),
        minimumInterval: t.Optional(t.Number()),
        maximumInterval: t.Optional(t.Number()),
        relearningSteps: t.Optional(t.Array(t.Number())),
        fsrsParameters: t.Optional(t.Any()),
      }),
      auth: true,
    }
  );

// User profile routes
const userRoutes = new Elysia({ prefix: "/api/user" })
  .use(authMiddleware)
  // Update user profile (name and username)
  .put(
    "/profile",
    async ({ body, auth }) => {
      if (!auth?.user) {
        return { error: "Unauthorized" };
      }

      // Update user in database
      const [updatedUser] = await db
        .update(user)
        .set({
          name: body.name,
          username: body.username || null,
        })
        .where(eq(user.id, auth.user.id))
        .returning();

      return { user: updatedUser };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        username: t.Optional(t.String({ minLength: 3, maxLength: 30 })),
      }),
      auth: true,
    }
  );

const app = new Elysia()
  .use(
    cors({
      // Allow requests from Next.js (proxy) and direct connections
      origin: [nextJsOrigin, serverOrigin].filter(Boolean),
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    })
  )
  // Handle favicon requests to prevent 404 errors
  .get("/favicon.ico", ({ set }) => {
    set.status = 204; // No Content - tells browser there's no favicon
    return;
  })
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    // Handle all HTTP methods that Better Auth might use
    if (["POST", "GET", "PUT", "DELETE", "PATCH"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .use(deckRoutes)
  .use(cardRoutes)
  .use(studyRoutes)
  .use(userRoutes)
  // Global error handler to catch and log errors (must be after routes)
  .onError(({ error, code, set, request }) => {
    // Ignore favicon requests to reduce noise in logs
    if (request.url.includes("/favicon.ico")) {
      set.status = 204;
      return;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Elysia error:", {
      code,
      message: errorMessage,
      stack: errorStack,
      path: request.url,
      method: request.method,
    });

    // Return appropriate status code based on error
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found", path: request.url };
    }

    set.status = 500;
    return {
      error: "Internal server error",
      message: errorMessage,
    };
  })
  .get("/", () => "Hello Elysia")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    console.log(
      `CORS enabled for: ${[nextJsOrigin, serverOrigin].filter(Boolean).join(", ")}`
    );
  });
