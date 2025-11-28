"use client";

import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-card">
      <div className="w-full max-w-md">
        <SignUpForm onSwitchToSignIn={() => router.push("/login")} />
      </div>
    </div>
  );
}
