import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import Header from "@/components/header";

export default async function DashboardPage() {
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

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 overflow-y-auto">
        <Dashboard session={session} />
      </div>
    </>
  );
}
