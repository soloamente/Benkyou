// API client for deck operations
// Handles all deck-related API calls to the Elysia server
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

// Type definitions for deck operations
export interface Deck {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeckRequest {
  name: string;
}

export interface UpdateDeckRequest {
  name: string;
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

// Create a new deck
export async function createDeck(data: CreateDeckRequest): Promise<Deck> {
  const response = await fetch(`${API_BASE_URL}/api/decks`, {
    method: "POST",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<Deck>(response);
}

// Get all decks for the current user
export async function getDecks(): Promise<Deck[]> {
  const response = await fetch(`${API_BASE_URL}/api/decks`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  const data = await handleResponse<Deck[] | { error: string }>(response);

  // Validate that we got an array, not an error object
  if (!Array.isArray(data)) {
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(data.error);
    }
    throw new Error("Invalid response: expected array of decks");
  }

  return data;
}

// Get a single deck by ID
export async function getDeck(id: string): Promise<Deck> {
  const response = await fetch(`${API_BASE_URL}/api/decks/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  return handleResponse<Deck>(response);
}

// Update a deck
export async function updateDeck(
  id: string,
  data: UpdateDeckRequest,
): Promise<Deck> {
  const response = await fetch(`${API_BASE_URL}/api/decks/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<Deck>(response);
}

// Delete a deck
export async function deleteDeck(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/decks/${id}`, {
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
