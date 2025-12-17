import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  real,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingSkipped: boolean("onboarding_skipped").default(false).notNull(),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("display_username").unique(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Display settings type for deck card appearance
export interface DeckDisplaySettings {
  theme: "dark" | "light" | string; // "dark", "light", or custom hex color
  targetWordColor: string; // hex color like "#4FB4FF"
  fontFamily: string; // "Rounded Mplus 1c", "Noto Sans JP", etc.
  fontSize: number; // 16, 18, 20, etc.
  fontWeight: number; // 400, 500, 600, etc.
}

// Default display settings for new decks
export const DEFAULT_DECK_DISPLAY_SETTINGS: DeckDisplaySettings = {
  theme: "dark",
  targetWordColor: "#4FB4FF",
  fontFamily: "Rounded Mplus 1c",
  fontSize: 16,
  fontWeight: 500,
};

// Deck table for flashcard decks
export const deck = pgTable(
  "deck",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Optional reference to note type for this deck's card template
    // If null, uses Basic note type
    noteTypeId: text("note_type_id").references(() => noteType.id, {
      onDelete: "set null",
    }),
    // Display settings for card appearance (theme, colors, fonts)
    displaySettings: jsonb("display_settings").$type<DeckDisplaySettings>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("deck_userId_idx").on(table.userId),
    index("deck_noteTypeId_idx").on(table.noteTypeId),
  ]
);

// Note Type table for customizable card templates (like Anki note types)
export const noteType = pgTable(
  "note_type",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Fields definition: array of { name: string, type: string }
    // Example: [{ name: "Front", type: "text" }, { name: "Back", type: "text" }]
    fields: jsonb("fields")
      .notNull()
      .$type<Array<{ name: string; type: string }>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("note_type_userId_idx").on(table.userId)]
);

// Note table for storing actual note data with flexible fields
export const note = pgTable(
  "note",
  {
    id: text("id").primaryKey(),
    deckId: text("deck_id")
      .notNull()
      .references(() => deck.id, { onDelete: "cascade" }),
    noteTypeId: text("note_type_id")
      .notNull()
      .references(() => noteType.id, { onDelete: "restrict" }),
    // Fields data: object with field names as keys and values
    // Example: { "Front": "What is React?", "Back": "A JavaScript library" }
    fields: jsonb("fields").notNull().$type<Record<string, string>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("note_deckId_idx").on(table.deckId),
    index("note_noteTypeId_idx").on(table.noteTypeId),
  ]
);

// Card table for flashcards (generated from notes)
export const card = pgTable(
  "card",
  {
    id: text("id").primaryKey(),
    deckId: text("deck_id")
      .notNull()
      .references(() => deck.id, { onDelete: "cascade" }),
    noteId: text("note_id").references(() => note.id, { onDelete: "cascade" }),
    // Keep front/back for backward compatibility and quick access
    // These are generated from note fields for Basic note type
    front: text("front").notNull(),
    back: text("back").notNull(),
    // FSRS (Free Spaced Repetition Scheduler) fields
    state: text("state")
      .notNull()
      .default("new")
      .$type<"new" | "learning" | "review" | "relearning">(),
    difficulty: real("difficulty").default(0.3).notNull(), // FSRS difficulty (0-1)
    stability: real("stability").default(0).notNull(), // FSRS stability (memory strength)
    lastReview: timestamp("last_review"), // Last review date
    dueDate: timestamp("due_date"), // Next review date
    interval: real("interval").default(0).notNull(), // Days until next review
    repetitions: integer("repetitions").default(0).notNull(), // Number of successful reviews
    lapses: integer("lapses").default(0).notNull(), // Number of times card was forgotten
    elapsedDays: integer("elapsed_days").default(0).notNull(), // Days since last review
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("card_deckId_idx").on(table.deckId),
    index("card_noteId_idx").on(table.noteId),
    index("card_dueDate_idx").on(table.dueDate),
    index("card_state_idx").on(table.state),
  ]
);

// Study Session table for tracking study sessions
export const studySession = pgTable(
  "study_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deckId: text("deck_id").references(() => deck.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    cardsStudied: integer("cards_studied").default(0).notNull(),
    cardsCorrect: integer("cards_correct").default(0).notNull(),
    cardsIncorrect: integer("cards_incorrect").default(0).notNull(),
    duration: integer("duration").default(0).notNull(), // Duration in minutes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("study_session_userId_idx").on(table.userId),
    index("study_session_deckId_idx").on(table.deckId),
    index("study_session_startedAt_idx").on(table.startedAt),
  ]
);

// Study Record table for tracking individual card reviews
export const studyRecord = pgTable(
  "study_record",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => studySession.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1=Again, 2=Hard, 3=Good, 4=Easy
    reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
    responseTime: integer("response_time").default(0).notNull(), // Response time in milliseconds
    previousState: text("previous_state")
      .$type<"new" | "learning" | "review" | "relearning">()
      .notNull(),
    newState: text("new_state")
      .$type<"new" | "learning" | "review" | "relearning">()
      .notNull(),
    previousDifficulty: real("previous_difficulty").notNull(),
    newDifficulty: real("new_difficulty").notNull(),
    previousStability: real("previous_stability").notNull(),
    newStability: real("new_stability").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("study_record_cardId_idx").on(table.cardId),
    index("study_record_sessionId_idx").on(table.sessionId),
    index("study_record_reviewedAt_idx").on(table.reviewedAt),
  ]
);

// User Study Settings table for user preferences
export const userStudySettings = pgTable(
  "user_study_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    newCardsPerDay: integer("new_cards_per_day").default(20).notNull(),
    maxReviewsPerDay: integer("max_reviews_per_day").default(200).notNull(),
    learningSteps: jsonb("learning_steps")
      .default([1, 10])
      .notNull()
      .$type<number[]>(), // Array of minutes, e.g., [1, 10]
    graduatingInterval: integer("graduating_interval").default(1).notNull(), // Days
    easyInterval: integer("easy_interval").default(4).notNull(), // Days
    minimumInterval: integer("minimum_interval").default(1).notNull(), // Days
    maximumInterval: integer("maximum_interval").default(36500).notNull(), // Days (100 years)
    relearningSteps: jsonb("relearning_steps")
      .default([10])
      .notNull()
      .$type<number[]>(), // Array of minutes
    fsrsParameters: jsonb("fsrs_parameters"), // Optional FSRS algorithm parameters for customization
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_study_settings_userId_idx").on(table.userId)]
);

// Relations for decks
export const deckRelations = relations(deck, ({ one, many }) => ({
  user: one(user, {
    fields: [deck.userId],
    references: [user.id],
  }),
  noteType: one(noteType, {
    fields: [deck.noteTypeId],
    references: [noteType.id],
  }),
  cards: many(card),
  notes: many(note),
  studySessions: many(studySession),
}));

// Relations for note types
export const noteTypeRelations = relations(noteType, ({ one, many }) => ({
  user: one(user, {
    fields: [noteType.userId],
    references: [user.id],
  }),
  notes: many(note),
  decks: many(deck),
}));

// Relations for notes
export const noteRelations = relations(note, ({ one, many }) => ({
  deck: one(deck, {
    fields: [note.deckId],
    references: [deck.id],
  }),
  noteType: one(noteType, {
    fields: [note.noteTypeId],
    references: [noteType.id],
  }),
  cards: many(card),
}));

// Relations for cards
export const cardRelations = relations(card, ({ one, many }) => ({
  deck: one(deck, {
    fields: [card.deckId],
    references: [deck.id],
  }),
  note: one(note, {
    fields: [card.noteId],
    references: [note.id],
  }),
  studyRecords: many(studyRecord),
}));

// Relations for study sessions
export const studySessionRelations = relations(
  studySession,
  ({ one, many }) => ({
    user: one(user, {
      fields: [studySession.userId],
      references: [user.id],
    }),
    deck: one(deck, {
      fields: [studySession.deckId],
      references: [deck.id],
    }),
    studyRecords: many(studyRecord),
  })
);

// Relations for study records
export const studyRecordRelations = relations(studyRecord, ({ one }) => ({
  card: one(card, {
    fields: [studyRecord.cardId],
    references: [card.id],
  }),
  session: one(studySession, {
    fields: [studyRecord.sessionId],
    references: [studySession.id],
  }),
}));

// Relations for user study settings
export const userStudySettingsRelations = relations(
  userStudySettings,
  ({ one }) => ({
    user: one(user, {
      fields: [userStudySettings.userId],
      references: [user.id],
    }),
  })
);

// User relations including decks
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  decks: many(deck),
  noteTypes: many(noteType),
  studySessions: many(studySession),
  studySettings: one(userStudySettings, {
    fields: [user.id],
    references: [userStudySettings.userId],
  }),
}));

// Export schema object for Better Auth adapter
export const schema = {
  user,
  session,
  account,
  verification,
  deck,
  noteType,
  note,
  card,
  studySession,
  studyRecord,
  userStudySettings,
  userRelations,
  sessionRelations,
  accountRelations,
  deckRelations,
  noteTypeRelations,
  noteRelations,
  cardRelations,
  studySessionRelations,
  studyRecordRelations,
  userStudySettingsRelations,
};
