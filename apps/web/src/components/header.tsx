"use client";
import Link from "next/link";
import { cn } from "@lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsScrolling(window.scrollY > 550);
    });
  }, []);
  return (
    <div className="flex flex-row items-center font-semibold z-10 h-fit fixed mt-5 top-0 left-0 right-0 justify-between w-full px-17 py-5">
      <div className="flex items-center gap-2 text-2xl">Benkyō</div>
      <div className="flex items-center gap-2  leading-none">
        <AnimatePresence>
          {isScrolling && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Link
                href="/"
                className="transition-all duration-500 ease-in-out"
              >
                Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <Link
          href="/register"
          className="bg-primary text-primary-foreground rounded-full px-5 py-2.75 transition-all duration-500 ease-in-out"
        >
          {isScrolling ? "Join Waitlist" : "Login"}
        </Link>
        <Link href="/dashboard"></Link>
      </div>
      {/* <nav className="flex gap-4 text-lg w-full">
        {links.map(({ to, label }) => {
          return (
            <Link key={to} href={to}>
              {label}
            </Link>
          );
        })}
      </nav> */}
    </div>
  );
}
