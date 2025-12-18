"use client";

import { motion } from "motion/react";
import { cn } from "@lib/utils";
import Link from "next/link";

interface CTASectionProps {
  className?: string;
}

export default function CTASection({ className }: CTASectionProps) {
  return (
    <section
      className={cn(
        "container mx-auto max-w-4xl px-4 py-20 md:py-32",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold md:text-5xl mb-4">
          Ready to improve your memory?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students who are already using Benkyō to study
          smarter and remember more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/register"
            className="bg-primary text-primary-foreground rounded-full px-8 py-4 font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Get Started Free
          </Link>
          <Link
            href="/decks"
            className="border border-border rounded-full px-8 py-4 font-semibold hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View Your Decks
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
