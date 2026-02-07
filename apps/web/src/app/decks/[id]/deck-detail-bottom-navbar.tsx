"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@lib/utils";

interface DeckDetailBottomNavbarProps {
  deckId: string;
}

export function DeckDetailBottomNavbar({ deckId }: DeckDetailBottomNavbarProps) {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push("/decks");
  };

  const handleCustomStudyClick = () => {
    router.push(`/study?deckId=${deckId}`);
  };

  const buttonClass = cn(
    "relative flex bg-[#212121] items-center justify-center w-fit text-sm cursor-pointer px-5 py-2.5 leading-none",
    "rounded-full",
    "transition-colors",
    "text-title-secondary hover:bg-accent hover:text-title"
  );

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-fit"
    >
      <div className="flex items-center gap-2 rounded-full px-1.5 py-1.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleHomeClick}
          className={buttonClass}
          aria-label="Home"
        >
          Home
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCustomStudyClick}
          className={buttonClass}
          aria-label="Custom Study"
        >
          Custom Study
        </motion.button>
      </div>
    </motion.nav>
  );
}
