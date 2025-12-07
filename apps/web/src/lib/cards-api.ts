// API client for card operations
// Handles all card-related API calls to the Elysia server
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

// Type definitions for card operations
export interface Card {
  id: string;
  deckId: string;
  noteId: string | null;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardRequest {
  deckId: string;
  front: string;
  back: string;
}

export interface UpdateCardRequest {
  front: string;
  back: string;
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

// Create a new card
export async function createCard(data: CreateCardRequest): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/cards`, {
    method: "POST",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<Card>(response);
}

// Get all cards for a deck
export async function getCards(deckId: string): Promise<Card[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/cards?deckId=${encodeURIComponent(deckId)}`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include", // Include cookies for authentication
    },
  );

  const data = await handleResponse<Card[] | { error: string }>(response);

  // Validate that we got an array, not an error object
  if (!Array.isArray(data)) {
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(data.error);
    }
    throw new Error("Invalid response: expected array of cards");
  }

  return data;
}

// Get a single card by ID
export async function getCard(id: string): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  return handleResponse<Card>(response);
}

// Update a card
export async function updateCard(
  id: string,
  data: UpdateCardRequest,
): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<Card>(response);
}

// Delete a card
export async function deleteCard(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.error || "An error occurred");
  }
}


