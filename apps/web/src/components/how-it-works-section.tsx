"use client";

import { motion } from "motion/react";
import { cn } from "@lib/utils";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  className?: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Create Your Decks",
    description:
      "Start by creating flashcard decks for any subject. Add questions and answers, or import existing content.",
  },
  {
    number: "02",
    title: "Study with Spaced Repetition",
    description:
      "Our algorithm schedules reviews at optimal intervals, helping you remember information long-term.",
  },
  {
    number: "03",
    title: "Track Your Progress",
    description:
      "Monitor your learning journey with detailed stats and insights. See how much you've improved over time.",
  },
];

export default function HowItWorksSection({
  className,
}: HowItWorksSectionProps) {
  return (
    <section
      className={cn(
        "container mx-auto max-w-6xl px-4 py-20 md:py-32",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-bold md:text-5xl mb-4">How it works</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get started in minutes and start improving your memory today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.15,
            }}
            className="relative"
          >
            <div className="flex flex-col items-start">
              <div className="text-6xl font-bold text-muted-foreground/20 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


















