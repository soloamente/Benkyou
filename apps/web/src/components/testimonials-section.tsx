"use client";

import { motion } from "motion/react";
import { cn } from "@lib/utils";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content:
      "Benkyō has completely transformed how I study. The spaced repetition algorithm is incredibly effective, and I've seen a huge improvement in my retention.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Language Learner",
    content:
      "I've tried many flashcard apps, but this one stands out. The interface is clean, the features are powerful, and it actually helps me remember what I learn.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "High School Student",
    content:
      "The progress tracking features are amazing. I can see exactly how much I've improved, which keeps me motivated to keep studying every day.",
    rating: 5,
  },
];

export default function TestimonialsSection({
  className,
}: TestimonialsSectionProps) {
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
          Loved by students worldwide
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of learners who are improving their memory and
          achieving their goals.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.1,
            }}
            className="p-6 rounded-2xl bg-card border border-border flex flex-col"
          >
            {testimonial.rating && (
              <div
                className="flex gap-1 mb-4"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-500" aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
            )}
            <p className="text-muted-foreground mb-6 grow leading-relaxed">
              "{testimonial.content}"
            </p>
            <div>
              <div className="font-semibold">{testimonial.name}</div>
              <div className="text-sm text-muted-foreground">
                {testimonial.role}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}





















