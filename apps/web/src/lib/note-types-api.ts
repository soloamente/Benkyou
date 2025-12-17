// API client for note type operations
// Handles note type CRUD for customizable card templates

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

// Type definitions for note types
export interface NoteTypeField {
  name: string;
  type: "text" | "reading" | "audio" | "image" | "number" | string;
  side: "front" | "back";
}

export interface NoteType {
  id: string;
  name: string;
  userId: string;
  fields: NoteTypeField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteTypeRequest {
  name: string;
  fields: NoteTypeField[];
}

export interface UpdateNoteTypeRequest {
  name?: string;
  fields?: NoteTypeField[];
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

    if (response.status === 404) {
      throw new Error("Note type not found.");
    }

    if (response.status === 400) {
      throw new Error(error.message || error.error || "Invalid request.");
    }

    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Get all note types for the current user
export async function getNoteTypes(): Promise<NoteType[]> {
  const response = await fetch(`${API_BASE_URL}/api/note-types`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  const data = await handleResponse<NoteType[] | { error: string }>(response);

  // Validate that we got an array, not an error object
  if (!Array.isArray(data)) {
    if (data && typeof data === "object" && "error" in data) {
      throw new Error(data.error);
    }
    throw new Error("Invalid response: expected array of note types");
  }

  return data;
}

// Get a single note type by ID
export async function getNoteType(id: string): Promise<NoteType> {
  const response = await fetch(`${API_BASE_URL}/api/note-types/${id}`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  return handleResponse<NoteType>(response);
}

// Create a new note type
export async function createNoteType(
  data: CreateNoteTypeRequest
): Promise<NoteType> {
  const response = await fetch(`${API_BASE_URL}/api/note-types`, {
    method: "POST",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<NoteType>(response);
}

// Update a note type
export async function updateNoteType(
  id: string,
  data: UpdateNoteTypeRequest
): Promise<NoteType> {
  const response = await fetch(`${API_BASE_URL}/api/note-types/${id}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
    body: JSON.stringify(data),
  });

  return handleResponse<NoteType>(response);
}

// Delete a note type
export async function deleteNoteType(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/note-types/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    credentials: "include", // Include cookies for authentication
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || error.error || "An error occurred");
  }
}

