"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@lib/utils";

const DECK_TABS = [
  { id: "info", label: "Info" },
  { id: "cards", label: "Cards" },
  { id: "stats", label: "Stats" },
  { id: "settings", label: "Settings" },
] as const;

type DeckTabId = (typeof DECK_TABS)[number]["id"];

interface DeckDetailNavbarProps {
  deckId: string;
}

export function DeckDetailNavbar({ deckId }: DeckDetailNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") as DeckTabId) || "cards";

  const handleTabClick = (tabId: DeckTabId) => {
    if (tabId === "stats") {
      router.push(`/stats?deckId=${deckId}`);
      return;
    }
    // Info, Cards, Settings: update tab param on deck detail page
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/decks/${deckId}?${params.toString()}`);
  };

  const handlePublishClick = () => {
    // TODO: Implement publish deck functionality
    console.log("Publish deck", deckId);
  };

  const handleShareClick = () => {
    // TODO: Implement share deck functionality
    console.log("Share deck", deckId);
  };

  return (
    <nav className="overflow-hidden font-normal justify-between flex w-full items-center">
      <div className="flex">
        {DECK_TABS.map((tab) => {
          const isActive =
            tab.id === "stats"
              ? pathname === "/stats" && searchParams.get("deckId") === deckId
              : pathname === `/decks/${deckId}` && currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                isActive
                  ? "bg-background"
                  : "bg-background/45 text-[#7c7c7c] font-medium",
                "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer transition-colors"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.25 items-center">
        <button
          type="button"
          onClick={handlePublishClick}
          className="text-sm w-fit rounded-full px-5 bg-background text-[#7c7c7c] font-medium py-2.5 cursor-pointer leading-none hover:text-foreground transition-colors"
        >
          Publish deck
        </button>
        <button
          type="button"
          onClick={handleShareClick}
          className="text-sm w-fit rounded-full px-5 bg-background text-[#7c7c7c] font-medium py-2.5 cursor-pointer leading-none hover:text-foreground transition-colors"
        >
          Share
        </button>
      </div>
    </nav>
  );
}
