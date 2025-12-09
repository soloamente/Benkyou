import { redirect } from "next/navigation";
import { Suspense } from "react";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import { BottomNavbar } from "@/components/bottom-navbar";

// Extract dynamic data fetching to a separate component
// This component accesses headers and makes API calls, so it needs to be wrapped in Suspense
async function DashboardContent() {
  // Get headers for server-side session retrieval
  const headersList = await headers();

  // Convert Next.js ReadonlyHeaders to Headers object for Better Auth
  const authHeaders = new Headers();
  headersList.forEach((value, key) => {
    authHeaders.set(key, value);
  });

  // Use server-side auth API to get session
  const session = await auth.api.getSession({
    headers: authHeaders,
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Check onboarding status via API and redirect if not completed
  // We use the API endpoint instead of direct database access
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const apiHeaders = new Headers();
  headersList.forEach((value, key) => {
    apiHeaders.set(key, value);
  });

  // Forward cookies for authentication
  const cookieHeader = headersList.get("cookie");
  if (cookieHeader) {
    apiHeaders.set("cookie", cookieHeader);
  }

  try {
    const response = await fetch(`${baseURL}/api/user/onboarding-status`, {
      method: "GET",
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store", // Don't cache this request
    });

    if (response.ok) {
      const status = await response.json();
      if (!status.onboardingCompleted) {
        // redirect() throws a NEXT_REDIRECT error that Next.js uses for navigation
        // This is expected behavior - don't catch it
        redirect("/onboarding");
      }
    }
  } catch (error: unknown) {
    // Only catch non-redirect errors
    // Next.js redirect() throws a NEXT_REDIRECT error which should not be caught
    // Check if it's a redirect error and re-throw it
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error; // Re-throw redirect errors so Next.js can handle them
    }
    // If there's an error checking status, allow access to dashboard
    // (fail open - better UX than blocking access)
    console.error("Error checking onboarding status:", error);
  }

  return (
    <main className="m-2.5 bg-background h-screen overflow-y-auto">
      <div className="bg-card rounded-3xl h-full overflow-hidden p-5 font-medium mx-auto w-full pb-24">
        <Dashboard session={session} />
      </div>
      <BottomNavbar />
    </main>
  );
}

// Loading fallback for Suspense boundary
function DashboardLoading() {
  return (
    <main className="m-2.5 bg-background h-screen overflow-y-auto">
      <div className="bg-card rounded-3xl h-full overflow-hidden p-5 font-medium mx-auto w-full pb-24">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
