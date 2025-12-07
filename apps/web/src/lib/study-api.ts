// API client for study operations
// Handles all study-related API calls to the Elysia server
// Uses Next.js proxy for requests (rewrites in next.config.ts)

// Use Next.js app URL for proxy - requests will be proxied to Elysia server via Next.js rewrites
// In browser, use window.location.origin; fallback to env var for SSR
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // For SSR, use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
};

const API_BASE_URL = getBaseURL();

// Type definitions for study operations
export interface StudyCard {
  id: string;
  deckId: string;
  noteId: string | null;
  front: string;
  back: string;
  state: "new" | "learning" | "review" | "relearning";
  difficulty: number;
  stability: number;
  lastReview: Date | null;
  dueDate: Date | null;
  interval: number;
  repetitions: number;
  lapses: number;
  elapsedDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  deckId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyStats {
  cardsDue: number;
  newCards: number;
  reviewCards: number;
  learnCount: number;
  studyTimeToday: number;
  cardsStudiedToday: number;
  streak: number;
}

export interface DailyStats {
  date: string;
  sessions: number;
  cardsStudied: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  studyTime: number;
}

export interface StudySettings {
  id: string;
  userId: string;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  learningSteps: number[];
  graduatingInterval: number;
  easyInterval: number;
  minimumInterval: number;
  maximumInterval: number;
  relearningSteps: number[];
  fsrsParameters: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewCardRequest {
  sessionId: string;
  rating: 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy
  responseTime?: number; // milliseconds
}

export interface StartSessionRequest {
  deckId?: string;
}

export interface EndSessionRequest {
  cardsStudied?: number;
  cardsCorrect?: number;
  cardsIncorrect?: number;
}

// Helper function to get auth headers with cookies
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Include credentials for cookie-based auth
  return headers;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`,
    }));

    // Provide more specific error messages based on status code
    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.");
    }

    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Get cards due for review
export async function getDueCards(deckId?: string): Promise<StudyCard[]> {
  const url = new URL(`${API_BASE_URL}/api/study/cards/due`);
  if (deckId) {
    url.searchParams.set("deckId", deckId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<StudyCard[]>(response);
}

// Get new cards available for study
export async function getNewCards(
  deckId?: string,
  limit?: number
): Promise<StudyCard[]> {
  const url = new URL(`${API_BASE_URL}/api/study/cards/new`);
  if (deckId) {
    url.searchParams.set("deckId", deckId);
  }
  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<StudyCard[]>(response);
}

// Get cards in learning state
export async function getLearningCards(deckId?: string): Promise<StudyCard[]> {
  const url = new URL(`${API_BASE_URL}/api/study/cards/learning`);
  if (deckId) {
    url.searchParams.set("deckId", deckId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<StudyCard[]>(response);
}

// Start a new study session
export async function startStudySession(
  data?: StartSessionRequest
): Promise<StudySession> {
  const response = await fetch(`${API_BASE_URL}/api/study/sessions`, {
    method: "POST",
    headers: await getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data || {}),
  });

  return handleResponse<StudySession>(response);
}

// End a study session
export async function endStudySession(
  sessionId: string,
  data?: EndSessionRequest
): Promise<StudySession> {
  const response = await fetch(
    `${API_BASE_URL}/api/study/sessions/${sessionId}/end`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data || {}),
    }
  );

  return handleResponse<StudySession>(response);
}

// Get preview of next review times for a card
export interface CardPreview {
  previews: Record<
    number,
    {
      dueDate: Date;
      interval: number;
    }
  >;
}

export async function getCardPreview(cardId: string): Promise<CardPreview> {
  const response = await fetch(
    `${API_BASE_URL}/api/study/cards/${cardId}/preview`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include",
    }
  );

  return handleResponse<CardPreview>(response);
}

// Submit a card review
export async function reviewCard(
  cardId: string,
  data: ReviewCardRequest
): Promise<StudyCard> {
  const response = await fetch(
    `${API_BASE_URL}/api/study/cards/${cardId}/review`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  return handleResponse<StudyCard>(response);
}

// Get study statistics
export async function getStudyStats(): Promise<StudyStats> {
  const response = await fetch(`${API_BASE_URL}/api/study/stats`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<StudyStats>(response);
}

// Get daily statistics
export async function getDailyStats(date?: string): Promise<DailyStats> {
  const url = new URL(`${API_BASE_URL}/api/study/stats/daily`);
  if (date) {
    url.searchParams.set("date", date);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<DailyStats>(response);
}

// Deck-specific statistics
export interface DeckStats {
  deckId: string;
  deckName: string;
  // Available cards (can be studied now)
  cardCounts: {
    due: number;
    new: number;
    learning: number;
    total: number;
  };
  // Total cards by state (all cards in deck)
  stateCounts: {
    new: number;
    learning: number;
    review: number;
    total: number;
  };
  overall: {
    sessions: number;
    cardsStudied: number;
    cardsCorrect: number;
    cardsIncorrect: number;
    studyTime: number; // minutes
    retentionRate: number; // percentage
  };
  today: {
    sessions: number;
    cardsStudied: number;
    cardsCorrect: number;
    cardsIncorrect: number;
    studyTime: number; // minutes
    retentionRate: number; // percentage
  };
  recentSessions: Array<{
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    cardsStudied: number;
    cardsCorrect: number;
    cardsIncorrect: number;
    duration: number; // minutes
  }>;
}

// Get deck-specific statistics
export async function getDeckStats(deckId: string): Promise<DeckStats> {
  const response = await fetch(
    `${API_BASE_URL}/api/study/stats/deck/${deckId}`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include",
    }
  );

  return handleResponse<DeckStats>(response);
}

// Get user study settings
export async function getStudySettings(): Promise<StudySettings> {
  const response = await fetch(`${API_BASE_URL}/api/study/settings`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<StudySettings>(response);
}

// Update user study settings
export async function updateStudySettings(
  settings: Partial<StudySettings>
): Promise<StudySettings> {
  const response = await fetch(`${API_BASE_URL}/api/study/settings`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(settings),
  });

  return handleResponse<StudySettings>(response);
}

// Heatmap data types
export interface HeatmapDay {
  date: string;
  cardsStudied: number;
  cardsDue: number;
  sessions: number;
}

export interface HeatmapSummary {
  dailyAverage: number;
  daysLearned: number; // percentage
  longestStreak: number;
  currentStreak: number;
  totalDays: number;
  daysWithActivity: number;
}

export interface HeatmapData {
  data: HeatmapDay[];
  summary: HeatmapSummary;
}

// Get heatmap data
export async function getHeatmapData(
  startDate?: string,
  endDate?: string,
  deckId?: string
): Promise<HeatmapData> {
  const url = new URL(`${API_BASE_URL}/api/study/stats/heatmap`);
  if (startDate) {
    url.searchParams.set("startDate", startDate);
  }
  if (endDate) {
    url.searchParams.set("endDate", endDate);
  }
  if (deckId) {
    url.searchParams.set("deckId", deckId);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<HeatmapData>(response);
}



