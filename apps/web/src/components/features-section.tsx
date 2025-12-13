"use client";

import { motion } from "motion/react";
import { cn } from "@lib/utils";

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FeaturesSectionProps {
  className?: string;
}

const features: Feature[] = [
  {
    title: "Smart Spaced Repetition",
    description:
      "Our algorithm adapts to your learning pace, showing cards at the optimal time for retention.",
  },
  {
    title: "Create Custom Decks",
    description:
      "Build your own flashcard decks or import from existing collections. Organize by subject, topic, or difficulty.",
  },
  {
    title: "Track Your Progress",
    description:
      "Monitor your study habits with detailed statistics and heatmaps. See your improvement over time.",
  },
  {
    title: "Study Anywhere",
    description:
      "Access your flashcards on any device. Study on the go with our responsive design.",
  },
];

export default function FeaturesSection({ className }: FeaturesSectionProps) {
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
        <h2 className="text-3xl font-bold md:text-5xl mb-4">
          Everything you need to study effectively
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Powerful features designed to help you learn faster and remember
          longer.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.1,
            }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


















