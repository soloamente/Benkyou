"use client"; // @NOTE: Add in case you are using Next.js

import { useState, useEffect } from "react";

import { AnimatePresence, type Variants, motion } from "motion/react";

import { cn } from "@lib/utils";

type InputProps = React.ComponentPropsWithRef<"input">;

type FieldState = "idle" | "filled";

export function Input({
  placeholder,
  onChange,
  className,
  value,
  ...props
}: InputProps) {
  const [fieldState, setFieldState] = useState<FieldState>(
    value && String(value).length > 0 ? "filled" : "idle"
  );

  useEffect(() => {
    setFieldState(value && String(value).length > 0 ? "filled" : "idle");
  }, [value]);

  const animatedPlaceholderVariants: Variants = {
    show: {
      x: 0,
      opacity: 1,
      filter: "blur(var(--blur-none))",
    },
    hidden: {
      x: 28,
      opacity: 0,
      filter: "blur(var(--blur-xs))",
    },
  };

  return (
    <div
      className={cn(
        "bg-main-secondary focus-within:border-primary/20 text-primary data-[filled=true]:border-border bg-background relative inline-flex h-12 w-64 items-center overflow-hidden rounded-xl shadow-xs transition-colors ease-out",
        "has-disabled:opacity-80 has-disabled:*:cursor-not-allowed",
        className
      )}
      data-filled={fieldState === "filled"}
    >
      <input
        {...props}
        value={value}
        className={cn(
          "peer caret-primary h-full w-full flex-1 bg-transparent px-4 py-2 outline-none placeholder:sr-only",
          "text-primary font-sf-pro-rounded text-sm/5.5 font-normal"
        )}
        placeholder={placeholder}
        onChange={(event) => {
          const newState = event.target.value.length > 0 ? "filled" : "idle";
          setFieldState(newState);
          onChange?.(event);
        }}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        {fieldState !== "filled" && (
          <motion.span
            className={cn(
              "pointer-events-none absolute left-4 w-full",
              "text-muted-foreground font-sf-pro-rounded text-sm/5.5 font-medium"
            )}
            variants={animatedPlaceholderVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{
              type: "spring",
              duration: 0.6,
              bounce: 0,
            }}
          >
            {placeholder}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
