import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import { Spinner } from "@/components/ui/spinner";
import AdminNav from "./admin-nav";
import { checkIsAdmin } from "./check-admin";

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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

  // Check if user is admin by calling the admin API endpoint
  // This endpoint is protected by admin middleware
  const adminCheck = await checkIsAdmin();

  if (!adminCheck.isAdmin) {
    console.log(`[AdminLayout] User ${session.user.id} is not an admin`);
    console.log(`[AdminLayout] Error:`, adminCheck.error);
    console.log(`[AdminLayout] Status:`, adminCheck.status);
    
    // If server is not reachable, show a more helpful error
    if (adminCheck.status === 0 || adminCheck.error?.includes("not reachable")) {
      throw new Error(
        `Cannot verify admin status: ${adminCheck.error}\n\n` +
        `Please make sure:\n` +
        `1. The Elysia server is running on port 3000\n` +
        `2. SERVER_URL environment variable is set correctly\n` +
        `3. The server is accessible from the Next.js app`
      );
    }
    
    redirect("/decks");
  }

  console.log(`[AdminLayout] ✅ User ${session.user.id} is an admin - allowing access to /admin`);

  return (
    <div className="flex flex-col h-svh min-h-0">
      <AdminNav />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

function AdminLayoutLoading() {
  return (
    <div className="flex items-center justify-center h-svh">
      <Spinner className="size-8" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
