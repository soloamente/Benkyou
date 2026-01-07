// Utility function to check if a user is admin
// Can be used in server components
// Uses Next.js API route instead of direct Elysia server call to avoid cookie/session issues
import { headers } from "next/headers";

export async function checkIsAdmin(): Promise<{ isAdmin: boolean; error?: string; status?: number; role?: string }> {
  const headersList = await headers();
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const cookieHeader = headersList.get("cookie");

  console.log("[checkIsAdmin] Starting admin check...");
  console.log("[checkIsAdmin] Base URL:", baseURL);
  console.log("[checkIsAdmin] Cookie header present:", !!cookieHeader);

  const apiHeaders = new Headers();
  if (cookieHeader) {
    apiHeaders.set("cookie", cookieHeader);
  }

  try {
    // Use Next.js API route instead of direct Elysia server call
    // This ensures cookies are passed correctly
    const url = `${baseURL}/api/admin/check`;
    console.log("[checkIsAdmin] Fetching:", url);
    
    const response = await fetch(url, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    });

    console.log("[checkIsAdmin] Response status:", response.status);
    console.log("[checkIsAdmin] Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Could not parse error" }));
      console.log("[checkIsAdmin] Error response:", errorData);
      
      return {
        isAdmin: false,
        error: errorData.error || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log("[checkIsAdmin] Response data:", data);
    console.log("[checkIsAdmin] ✅ User is admin:", data.isAdmin);
    
    return {
      isAdmin: data.isAdmin || false,
      role: data.role,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[checkIsAdmin] ❌ Error checking admin status:", errorMessage);
    
    return {
      isAdmin: false,
      error: errorMessage,
    };
  }
}
