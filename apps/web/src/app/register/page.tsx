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
      router.push("/dashboard");
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
    <div className="flex min-h-dvh items-center justify-center bg-card">
      <div className="w-full max-w-md">
        <SignUpForm onSwitchToSignIn={() => router.push("/login")} />
      </div>
    </div>
  );
}
