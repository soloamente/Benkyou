"use client";

import { useEffect, useState } from "react";

// Client component that provides the current year
// Uses useState to avoid blocking during prerender
// Static fallback year (2025) to avoid new Date() during prerender
const FALLBACK_YEAR = 2025;

export function FooterYear() {
  const [year, setYear] = useState<number>(FALLBACK_YEAR);

  useEffect(() => {
    // Calculate year on client side to avoid blocking prerender
    setYear(new Date().getFullYear());
  }, []);

  // Use static fallback during SSR/prerender to avoid new Date() error
  return <>{year}</>;
}
