"use client";

import { cn } from "@lib/utils";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Cards({ className }: { className?: string }) {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Track scroll position to determine when to hide cards
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Start hiding cards when user scrolls down more than 50px
      setIsScrolling(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top hero image */}
      <motion.div
        key="top-hero"
        initial={{
          y: "-100%",
        }}
        animate={{
          y: isScrolling ? "-100%" : "-10%",
        }}
        transition={
          isScrolling
            ? {
                type: "tween",
                duration: 0.4,
                ease: "easeOut",
              }
            : {
                type: "spring",
                stiffness: 120,
                damping: 50,
                mass: 0.5,
                delay: 0,
                restSpeed: 0.01,
                restDelta: 0.01,
              }
        }
        style={{
          willChange: "transform",
        }}
        className={cn(
          "fixed top-0 left-0 w-full pointer-events-none z-0 overflow-visible will-change-transform",
          className
        )}
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/hero/top.png"
            alt="Cards top"
            width={10000}
            height={10000}
            className="w-full h-auto object-contain"
          />
        </div>
      </motion.div>

      {/* Right hero image */}
      <motion.div
        key="right-hero"
        initial={{
          x: "100%",
        }}
        animate={{
          x: isScrolling ? "100%" : "0%",
        }}
        transition={
          isScrolling
            ? {
                type: "tween",
                duration: 0.4,
                ease: "easeOut",
              }
            : {
                type: "spring",
                stiffness: 120,
                damping: 50,
                mass: 0.5,
                delay: 0.05,
                restSpeed: 0.01,
                restDelta: 0.01,
              }
        }
        style={{
          willChange: "transform",
        }}
        className={cn(
          "fixed top-0 right-0 h-full pointer-events-none z-1 overflow-visible will-change-transform",
          className
        )}
      >
        <div className="relative h-full overflow-visible">
          <Image
            src="/hero/right.png"
            alt="Cards right"
            width={10000}
            height={10000}
            className="h-full w-auto object-contain"
          />
        </div>
      </motion.div>

      {/* Left hero image */}
      <motion.div
        key="left-hero"
        initial={{
          x: "-100%",
        }}
        animate={{
          x: isScrolling ? "-100%" : "0%",
        }}
        transition={
          isScrolling
            ? {
                type: "tween",
                duration: 0.4,
                ease: "easeOut",
              }
            : {
                type: "spring",
                stiffness: 120,
                damping: 50,
                mass: 0.5,
                delay: 0.03,
                restSpeed: 0.01,
                restDelta: 0.01,
              }
        }
        style={{
          willChange: "transform",
        }}
        className={cn(
          "fixed top-0 left-0 h-full pointer-events-none z-1 overflow-visible will-change-transform",
          className
        )}
      >
        <div className="relative h-full overflow-visible">
          <Image
            src="/hero/left.png"
            alt="Cards left"
            width={10000}
            height={10000}
            className="h-full w-auto object-contain"
          />
        </div>
      </motion.div>

      {/* Bottom hero image */}
      <motion.div
        key="bottom-hero"
        initial={{
          y: "100%",
        }}
        animate={{
          y: isScrolling ? "100%" : "0%",
        }}
        transition={
          isScrolling
            ? {
                type: "tween",
                duration: 0.4,
                ease: "easeOut",
              }
            : {
                type: "spring",
                stiffness: 120,
                damping: 50,
                mass: 0.5,
                delay: 0.08,
                restSpeed: 0.01,
                restDelta: 0.01,
              }
        }
        style={{
          willChange: "transform",
        }}
        className={cn(
          "fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-visible will-change-transform",
          className
        )}
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/hero/bottom.png"
            alt="Cards bottom"
            width={10000}
            height={10000}
            className="w-full h-auto object-contain"
          />
        </div>
      </motion.div>

      {/* Gradient overlay - transparent at bottom to background at top */}
      <div className="fixed bottom-0 bg-linear-to-b from-transparent to-background via-background/80 to-90% from-10% via-60% left-0 right-0 h-[40%] pointer-events-none z-5" />
      <div className="fixed top-0 bg-linear-to-t from-transparent to-background via-background/80 to-100% from-10% via-60% left-0 right-0 h-[40%] pointer-events-none z-5" />

      {/* <div className="flex flex-col justify-start font-medium  absolute shadow-lg shadow-black/50 rotate-70 px-7.5 py-10 -bottom-20 gap-14 -left-40 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-9 px-7.5 py-10 -bottom-20 gap-14 left-15 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I space place from ?? to ??...
        </h1>
        <h2 className="text-[1.375rem]">
          The space of the are from A to D is equal to...
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-7.5 py-10 -bottom-30 gap-14 left-70 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-[1.375rem] text-[#4FB4FF]">Take a picture</h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-40 gap-14 left-175 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-4xl">Pythagorean theorem</h1>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-10 px-7.5 py-10 -bottom-20 gap-14 left-130 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem]">
          World War I took place from <span className="text-[#737373]">??</span>{" "}
          to <span className="text-[#737373]">??</span>
        </h1>
        <h2 className="text-[1.375rem]">
          World War I took place from{" "}
          <span className="text-[#737373]">1914</span> to{" "}
          <span className="text-[#737373]">1918</span>.
        </h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-20 gap-14 left-235 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-5xl">
          How do you say <span className="text-[#FFB640]">Hello</span> in
          spanish?
        </h1>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 -rotate-11 px-7.5 py-10 -bottom-25 gap-14 left-350 bg-card w-3xs h-80 rounded-4xl items-start">
        <h1 className="text-[1.375rem] font-mPlusRounded">
          俺はスマホで
          <span className="text-[#4FB4FF] ">写真 を撮った。</span>
        </h1>
        <h2 className="text-[1.375rem] text-[#4FB4FF]">Take a picture</h2>
      </div>
      <div className="flex flex-col justify-start font-medium absolute shadow-lg shadow-black/50 rotate-3 px-7.5 py-10 -bottom-40 gap-14 left-295 bg-card w-3xs h-80 rounded-4xl items-center">
        <h1 className="text-4xl">Who's the creator of Benkyō</h1>
      </div> */}
    </>
  );
}
