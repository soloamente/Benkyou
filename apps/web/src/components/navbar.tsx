"use client";

import { cn } from "@lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="overflow-hidden font-normal justify-between flex w-full items-center">
      <div className="flex gap-1.25">
        <div
          className={cn(
            pathname === "/decks"
              ? "bg-background"
              : "bg-background/45 text-[#7c7c7c] font-medium",
            "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer"
          )}
        >
          <p>Japanese</p>
        </div>
        <div
          className={cn(
            "bg-background/45 text-[#7c7c7c] font-medium",
            "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer"
          )}
        >
          <p>Korean</p>
        </div>
        <div
          className={cn(
            "bg-background/45 text-[#7c7c7c] font-medium",
            "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer"
          )}
        >
          <p>Math</p>
        </div>
        <div
          className={cn(
            "bg-background/45 text-[#7c7c7c] font-medium",
            "text-sm w-fit rounded-full px-5 leading-none py-2.5 cursor-pointer"
          )}
        >
          <p>Exam preparation</p>
        </div>
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
    </div>
  );
}
