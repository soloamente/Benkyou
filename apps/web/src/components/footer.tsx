"use client";

import Link from "next/link";
import { cn } from "@lib/utils";
import { FooterYear } from "./footer-year";

interface FooterProps {
  className?: string;
}

interface FooterLink {
  label: string;
  href: string;
}

const footerLinks: { category: string; links: FooterLink[] }[] = [
  {
    category: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Decks", href: "/decks" },
    ],
  },
  {
    category: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    category: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Support", href: "#support" },
      { label: "Privacy", href: "#privacy" },
    ],
  },
];

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand section */}
          <div className="md:col-span-1">
            <Link
              href={"/" as any} // Type assertion needed for typed routes
              className="text-2xl font-semibold mb-4 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Benkyō
            </Link>
            <p className="text-sm text-muted-foreground">
              A better way to study with flashcards.
            </p>
          </div>

          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold mb-4">{section.category}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as any} // Type assertion needed for typed routes (hash anchors and routes)
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © <FooterYear /> Benkyō. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href={"#terms" as any} // Type assertion needed for typed routes
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Terms
            </Link>
            <Link
              href={"#privacy" as any} // Type assertion needed for typed routes
              className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
