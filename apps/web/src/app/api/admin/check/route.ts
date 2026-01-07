import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * API route to check if the current user is an admin
 * This route proxies the request to the Elysia server's /api/admin/check endpoint
 * We use this approach instead of importing @benkyou/db directly to avoid build issues
 */
export async function GET() {
  try {
    const headersList = await headers();
    const serverURL = process.env.SERVER_URL || "http://localhost:3000";
    const cookieHeader = headersList.get("cookie");

    // Forward request to Elysia server to check admin status
    const apiHeaders = new Headers();
    if (cookieHeader) {
      apiHeaders.set("cookie", cookieHeader);
    }
    // Forward all relevant headers
    headersList.forEach((value, key) => {
      if (
        key.toLowerCase() === "cookie" ||
        key.toLowerCase() === "authorization" ||
        key.toLowerCase() === "user-agent"
      ) {
        apiHeaders.set(key, value);
      }
    });

    // Use the lightweight admin check endpoint on Elysia server
    const response = await fetch(`${serverURL}/api/admin/check`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 403) {
      // User is authenticated but not admin
      return NextResponse.json({
        isAdmin: false,
        error: "User is not an admin",
        status: 403,
      });
    }

    if (response.status === 401) {
      // User is not authenticated
      return NextResponse.json({
        isAdmin: false,
        error: "Not authenticated",
        status: 401,
      });
    }

    if (response.ok) {
      // User is admin - return the full response from Elysia
      const data = await response.json().catch(() => ({ isAdmin: true }));
      return NextResponse.json({
        isAdmin: true,
        ...data,
        status: 200,
      });
    }

    // Other error
    const errorText = await response.text().catch(() => "Unknown error");
    return NextResponse.json(
      {
        isAdmin: false,
        error: errorText,
        status: response.status,
      },
      { status: response.status }
    );
  } catch (error) {
    console.error("Error checking admin status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Check if it's a connection error
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("fetch failed")
    ) {
      return NextResponse.json(
        {
          isAdmin: false,
          error: `Server not reachable. Make sure the Elysia server is running on port 3000.`,
          status: 0,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        isAdmin: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
