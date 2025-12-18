"use client";

import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session?.user) {
      // If user doesn't have a name, they need to complete onboarding
      if (!session.user.name || session.user.name.trim() === "") {
        router.push("/onboarding");
      } else {
        router.push("/decks");
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (session?.user) {
    return null; // Will redirect
  }

  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl h-full min-h-0 font-medium">
      <div className="flex w-full max-w-md flex-col space-y-6 p-5">
        <SignUpForm onSwitchToSignIn={() => router.push("/login")} />
      </div>
    </main>
  );
}
