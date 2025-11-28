import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { authClient } from "@lib/auth-client";
import Header from "@/components/header";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
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
