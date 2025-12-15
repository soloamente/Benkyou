import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { type Deck } from "@/lib/decks-api";
import IconCheck3 from "@components/icons/check-3";
import IconPlusSm from "./plus-sm";
import IconVShapedArrowDownOutlineDuo18 from "@components/icons/v-shaped-arrow-down";

export interface DeckSettingsContentProps {
  params: Promise<{ id: string }>;
}

// Extract dynamic data fetching to a separate component.
// This component awaits params and calls an uncached fetch (cookie-auth), so it MUST be wrapped in <Suspense>
// in Next.js 16+ to avoid "Blocking Route" warnings and to keep the route streaming fast.
export async function DeckSettingsContent({
  params,
}: DeckSettingsContentProps) {
  const { id } = await params;

  // IMPORTANT:
  // We intentionally do NOT use the browser-oriented `getDeck()` helper here.
  // In server components, fetch does not automatically forward the user's cookies unless we do it ourselves.
  // So we read the incoming Cookie header and forward it to the API request, same as the deck detail page.
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

  let deck: Deck | null = null;
  try {
    const response = await fetch(`${serverUrl}/api/decks/${id}`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      // This is user-specific (cookie-auth), so we never want to cache it.
      cache: "no-store",
    });

    if (!response.ok) {
      // If the deck doesn't exist, or the user isn't authorized, show the standard not-found UI.
      notFound();
    }

    deck = (await response.json()) as Deck;
  } catch (error) {
    // If the fetch fails (API down, etc), treat it as not-found for now to avoid crashing the route.
    // (We can revisit later and show an error state instead of 404 if desired.)
    console.error("Error fetching deck settings deck:", error);
    notFound();
  }

  return (
    <main className="flex flex-col h-screen bg-background gap-3.75 m-5">
      {/* Breadcrumb Navigation - centered at top */}
      <div className="w-full">
        {/*
          Persisted CSS changes from browser preview:
          - width: 100%                  -> `w-full`
          - font-weight: 500             -> `font-medium`
          - font-size: 18px              -> `text-lg`
          - text-align: center           -> `text-center`
          - vertical-align: middle       -> `align-middle` (harmless on flex containers; matches requested CSS)
          - Decks link opacity: 0.4      -> `opacity-40`
          - "/" separators opacity: 0.5  -> `opacity-50`
          - crumb color                  -> `text-title-secondary`
          - "Settings" font-weight: 600  -> `font-semibold`
        */}
        <div className="flex w-full gap-2 items-center justify-center font-medium text-lg text-center align-middle">
          <Link href="/dashboard" className="text-title-secondary opacity-40">
            Decks
          </Link>
          <span className="text-title-secondary opacity-50">/</span>
          <span className="text-title-secondary">{deck.name}</span>
          <span className="text-title-secondary opacity-50">/</span>
          <span className="text-title-secondary font-semibold">Settings</span>
        </div>
      </div>

      {/* main content section */}
      <div className="flex gap-2.5 w-full h-full">
        {/* Deck preview section */}
        <div className="h-full w-full flex flex-col gap-2.5 flex-1">
          <div className="flex h-full flex-1 w-full flex-col gap-2.5 bg-card rounded-[30px] relative justify-center items-center">
            <button className="absolute bottom-4 left-4 leading-none px-5 py-3.75 bg-background rounded-full">
              Front side
            </button>
            <button className="absolute bottom-4 right-4 leading-none px-5 py-3.75 bg-background rounded-full">
              Show back side
            </button>
          </div>
          {/* Deck theme section */}
          <div className="flex gap-auto w-full justify-between shrink-0">
            <div className="bg-card w-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none ">
              Deck Theme
              <div className="flex gap-1.25">
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-card w-full h-full flex items-center justify-center">
                    <IconCheck3 size={14} strokeWidth={3} />
                  </div>
                </button>
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-primary w-full h-full" />
                </button>
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-[#14120B] w-full h-full" />
                </button>
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-linear-to-t from-card to-primary w-full h-full">
                    <IconPlusSm />
                  </div>
                </button>
              </div>
            </div>

            {/* Target Word Color section */}

            <div className="bg-card w-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
              Target Word Color
              <div className="flex gap-1.25">
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-[#4FB4FF] w-full h-full flex items-center justify-center">
                    <IconCheck3 size={14} strokeWidth={3} />
                  </div>
                </button>
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-[#EFE7DE] w-full h-full" />
                </button>
                <button className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
                  <div className="rounded-full bg-linear-to-t from-card to-primary w-full h-full">
                    <IconPlusSm />
                  </div>
                </button>
              </div>
            </div>

            {/* Font section */}
            <div className="bg-card w-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
              Font
              <div className="flex gap-1.25">
                {/* TODO: Add fonts - Font select */}
                <div className="flex cursor-pointer rounded-full items-center bg-background px-3.75 py-2.5 w-fit leading-none gap-3.75">
                  Rounded Mplus 1c
                  <IconVShapedArrowDownOutlineDuo18
                    size={18}
                    strokeWidth={3.5}
                    className="opacity-40"
                  />
                </div>
              </div>
            </div>
            {/* Font section */}
            <div className="bg-card w-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
              Font Size
              <div className="flex gap-1.25">
                {/* TODO: Add fonts - Font select */}
                <div className="flex cursor-pointer rounded-full items-center bg-background px-2.5 py-2.5 w-fit leading-none gap-3.75">
                  18
                </div>
              </div>
            </div>
            {/* Font Weight */}
            <div className="bg-card w-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
              Font Weight
              <div className="flex gap-1.25">
                {/* TODO: Add fonts - Font select */}
                <div className="flex cursor-pointer rounded-full items-center bg-background px-2.5 py-2.5 w-fit leading-none gap-3.75">
                  500
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right-side controls column: make width flexible and allow it to shrink with the page.
            Previously this used `flex-0 min-w-[280px]`, which forced a fixed 280px sidebar and
            prevented it from shrinking on smaller viewports. By switching to `flex-1 min-w-0`
            we let the column take available space while still allowing it to shrink and wrap
            according to the overall layout. */}
        <div className="flex flex-col gap-2.5 w-full h-full flex-1 min-w-0">
          <div className="flex flex-col gap-2.5 w-full h-full">
            {/* Font Weight */}
            <div className="bg-card w-full justify-between flex items-center gap-5 rounded-4xl px-2.5 py-2.5 leading-none">
              <div className="flex items-center gap-2.5">
                {" "}
                <div className="flex cursor-pointer rounded-full justify-center items-center bg-background px-2.5 py-1.75 h-[32px] w-[32px] leading-none ">
                  1
                </div>
                Target Word Field
              </div>
              <div className="flex gap-1.25">
                {/* TODO: Add fonts - Font select */}
                <div className="flex cursor-pointer rounded-full items-center bg-background px-2.5 py-2.5 w-fit leading-none gap-3.75">
                  500
                </div>
              </div>
            </div>
          </div>
          {/* Target Word Color section */}

          <button className="bg-primary cursor-pointer font-semibold text-primary-foreground w-full justify-between flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
            <p>Finish and save</p>
            <div className="flex gap-1.25 ">
              <div className="flex flex-col cursor-pointer rounded-full text-primary justify-center items-center bg-background w-[36px] h-[36px]">
                <IconCheck3 size={18} strokeWidth={3} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
