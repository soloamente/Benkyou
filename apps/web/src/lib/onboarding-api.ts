// API client for onboarding operations
// Handles onboarding status checks and profile completion

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
};

const API_BASE_URL = getBaseURL();

// Type definitions
export interface OnboardingStatus {
  onboardingCompleted: boolean;
  onboardingSkipped?: boolean;
}

export interface OnboardingData {
  name?: string;
  username?: string;
  avatar?: File | string;
  goals?: string[];
  bio?: string;
}

export interface OnboardingResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    onboardingCompleted: boolean;
  };
  error?: string;
  message?: string;
}

// Helper function to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  return headers;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP error! status: ${response.status}`,
    }));

    if (response.status === 401) {
      throw new Error("Unauthorized. Please log in again.");
    }

    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

// Get onboarding status
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const response = await fetch(`${API_BASE_URL}/api/user/onboarding-status`, {
    method: "GET",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<OnboardingStatus>(response);
}

// Complete onboarding - save profile data
export async function completeOnboarding(
  data: OnboardingData
): Promise<OnboardingResponse> {
  // Handle file upload if avatar is a File
  const formData = new FormData();

  if (data.avatar instanceof File) {
    formData.append("avatar", data.avatar);
  } else if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  if (data.name) {
    formData.append("name", data.name);
  }
  if (data.username) {
    formData.append("username", data.username);
  }
  if (data.goals && data.goals.length > 0) {
    formData.append("goals", JSON.stringify(data.goals));
  }
  if (data.bio) {
    formData.append("bio", data.bio);
  }

  const response = await fetch(`${API_BASE_URL}/api/user/onboarding`, {
    method: "POST",
    headers: {
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
    credentials: "include",
    body: formData,
  });

  return handleResponse<OnboardingResponse>(response);
}

// Skip onboarding - mark as completed without requiring profile data
export async function skipOnboarding(): Promise<OnboardingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/user/skip-onboarding`, {
    method: "POST",
    headers: await getAuthHeaders(),
    credentials: "include",
  });

  return handleResponse<OnboardingResponse>(response);
}
