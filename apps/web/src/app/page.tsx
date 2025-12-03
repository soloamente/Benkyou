"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CardsBottom from "@components/cards-bottom";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.push("/dashboard");
      }
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

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="container mx-auto z-10 max-w-2xl px-4 text-center gap-4 flex flex-col items-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          A better way to study with flashcards
        </h1>

        <label className="flex items-center bg-primary w-fit text-primary-foreground text-[16px] rounded-full pr-1.25 pl-6.25 py-1.25 gap-2">
          <input
            type="email"
            placeholder="email@example.com"
            className="leading-none focus:outline-none font-medium w-40 flex items-center"
          />
          <button className="bg-background cursor-pointer rounded-full leading-none text-primary px-6 py-3.75">
            Join Waitlist
          </button>
        </label>
      </div>
      <CardsBottom />
    </div>
  );
}
