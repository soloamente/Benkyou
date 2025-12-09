"use client";

import { authClient } from "@/lib/auth-client";
import Cards from "@components/cards";
import Header from "@components/header";
import FeaturesSection from "@components/features-section";
import HowItWorksSection from "@components/how-it-works-section";
import TestimonialsSection from "@components/testimonials-section";
import CTASection from "@components/cta-section";
import Footer from "@components/footer";

export default function Home() {
  // Allow logged-in users to view the landing page
  // No redirect needed - users can navigate to dashboard via navigation if desired

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center relative">
        <div className="container mx-auto z-10 max-w-5xl px-4 text-center gap-4 flex flex-col items-center">
          <h1 className="mb-4 text-4xl font-bold sm:text-8xl md:text-8xl">
            A better way to study with flashcards
          </h1>

          <label className="flex items-center bg-primary w-fit text-primary-foreground text-[16px] rounded-full pr-1.25 pl-6.25 py-1.25 gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              className="leading-none focus:outline-none font-medium w-40 flex items-center"
            />
            <button className="bg-background cursor-pointer rounded-full leading-none text-primary px-6 py-3.75">
              Join Waitlist
            </button>
          </label>
        </div>
        <Cards />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
