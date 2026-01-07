"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getDecks } from "@/lib/decks-api";

export type Subject = string;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSubject = searchParams.get("subject") || "All";
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Fetch decks to extract unique subjects
  useEffect(() => {
    const loadDecks = async () => {
      try {
        const fetchedDecks = await getDecks();
        // Extract unique subjects from decks (excluding null/undefined)
        const uniqueSubjects = new Set<string>();
        fetchedDecks.forEach((deck) => {
          if (deck.subject) {
            uniqueSubjects.add(deck.subject);
          }
        });
        // Always include "All" as the first option, then sorted unique subjects
        setSubjects(["All", ...Array.from(uniqueSubjects).sort()]);
      } catch (error) {
        console.error("Error loading decks for subjects:", error);
        setSubjects(["All"]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    loadDecks();
  }, []);

  const handleSubjectClick = (subject: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subject === "All") {
      params.delete("subject");
    } else {
      params.set("subject", subject);
    }
    router.push(`${pathname}?${params.toString()}` as any);
  };

  return (
    <nav className="overflow-hidden font-normal justify-between flex w-full items-center">
      <div className="flex">
        {isLoadingSubjects ? (
          <div className="text-sm text-[#7c7c7c] font-medium px-5 py-2.5">
            Loading...
          </div>
        ) : (
          subjects.map((subject) => {
            const isActive =
              subject === "All"
                ? selectedSubject === "All" || !searchParams.has("subject")
                : selectedSubject === subject;
            return (
              <button
                key={subject}
                onClick={() => handleSubjectClick(subject)}
                className={cn(
                  isActive
                    ? "bg-background"
                    : "bg-background/45 text-[#7c7c7c] font-medium",
                  "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer transition-colors"
                )}
              >
                <p>{subject}</p>
              </button>
            );
          })
        )}
      </div>
      <div className="flex gap-1.25 items-center">
        <button className="text-sm w-fit rounded-full px-5 bg-background text-[#7c7c7c] font-medium py-2.5 cursor-pointer leading-none">
          Track your study
        </button>
        <label className="bg-background  justify-between  items-center flex rounded-full pl-5 pr-2.75 py-1.75 text-sm leading-none">
          <input
            type="text"
            placeholder="Search decks..."
            className="focus:outline-none w-36 placeholder:font-medium placeholder:text-[#7c7c7c]"
          />
          <div className="gap-0.5 flex items-center">
            <div className="bg-card rounded-[9px] text-[#7c7c7c] font-medium px-1.75 py-1.5 h-5 flex items-center justify-center text-xs leading-none">
              ctrl
            </div>
            <div className="bg-card rounded-[9px] text-[#7c7c7c] font-medium  h-5 w-5 flex items-center justify-center text-xs leading-none">
              s
            </div>
          </div>
        </label>{" "}
      </div>
    </nav>
  );
}
