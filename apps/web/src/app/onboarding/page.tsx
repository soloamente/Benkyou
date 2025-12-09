import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import OnboardingClient from "./onboarding-client";

/**
 * Extract dynamic data fetching to a separate component
 * This component accesses headers and makes API calls, so it needs to be wrapped in Suspense
 */
async function OnboardingContent() {
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

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return <OnboardingClient session={session} />;
}

// Loading fallback for Suspense boundary
function OnboardingLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

/**
 * Server component wrapper for onboarding page
 * Checks authentication and passes session to client component
 */
export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  );
}
