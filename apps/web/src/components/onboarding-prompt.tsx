"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
// Using button element directly for now - can be replaced with Button component if available

interface OnboardingPromptProps {
  onProceed: () => void;
  onSkip: () => void;
}

/**
 * Prompt component that asks users if they want to set up their profile now or later
 */
export default function OnboardingPrompt({
  onProceed,
  onSkip,
}: OnboardingPromptProps) {
  const router = useRouter();

  const handleLater = () => {
    onSkip();
    router.push("/dashboard");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
          }}
          className="bg-card border border-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-lg"
        >
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold leading-none">
                Set up your profile
              </h1>
              <p className="text-md text-title-secondary">
                Would you like to set up your profile now or later?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onProceed}
                className="w-full py-3 rounded-2xl font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
              >
                Set up now
              </button>
              <button
                onClick={handleLater}
                className="w-full py-3 rounded-2xl font-medium border border-border bg-background hover:bg-border/50 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


