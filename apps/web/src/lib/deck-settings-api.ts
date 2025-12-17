// API client for deck settings operations
// Handles deck display settings and note type configuration

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

// Type definitions for deck settings
export interface DeckDisplaySettings {
  theme: "dark" | "light" | string; // "dark", "light", or custom hex color
  targetWordColor: string; // hex color like "#4FB4FF"
  fontFamily: string; // "Rounded Mplus 1c", "Noto Sans JP", etc.
  fontSize: number; // 16, 18, 20, etc.
  fontWeight: number; // 400, 500, 600, etc.
}

export interface NoteTypeField {
  name: string;
  type: "text" | "reading" | "audio" | "image" | "number" | string;
  side: "front" | "back";
}

export interface NoteType {
  id: string;
  name: string;
  fields: NoteTypeField[];
}

export interface DeckSettings {
  id: string;
  name: string;
  noteTypeId: string | null;
  displaySettings: DeckDisplaySettings;
  noteType: NoteType | null;
}

export interface UpdateDeckSettingsRequest {
  noteTypeId?: string;
  displaySettings?: Partial<DeckDisplaySettings>;
}

// Default display settings (matches the server defaults)
export const DEFAULT_DECK_DISPLAY_SETTINGS: DeckDisplaySettings = {
  theme: "dark",
  targetWordColor: "#4FB4FF",
  fontFamily: "Rounded Mplus 1c",
  fontSize: 16,
  fontWeight: 500,
};

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

    if (response.status === 404) {
      throw new Error("Deck not found.");
    }

    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Get deck settings (display settings and note type)
export async function getDeckSettings(deckId: string): Promise<DeckSettings> {
  const response = await fetch(`${API_BASE_URL}/api/decks/${deckId}/settings`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  return handleResponse<DeckSettings>(response);
}

// Update deck settings (display settings and/or note type)
export async function updateDeckSettings(
  deckId: string,
  data: UpdateDeckSettingsRequest
): Promise<DeckSettings> {
  const response = await fetch(`${API_BASE_URL}/api/decks/${deckId}/settings`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<DeckSettings>(response);
}

