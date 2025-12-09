"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { Input } from "@components/ui/input";
import { authClient } from "@lib/auth-client";

const variants = {
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};

export default function OnboardingPage() {
  const { data: session } = authClient.useSession();
  const [isTypingName, setIsTypingName] = useState(false);
  const [isTypingUsername, setIsTypingUsername] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? "");
  const [username, setUsername] = useState(session?.user?.username ?? "");
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [ref, bounds] = useMeasure();
  const [hasMeasured, setHasMeasured] = useState(false);

  useEffect(() => {
    if (bounds.height > 0 && !hasMeasured) {
      setHasMeasured(true);
    }
  }, [bounds.height, hasMeasured]);

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl leading-none">What's your name?</h1>
              <h2 className="text-md text-title-secondary">
                This is the name people will see in your profile.
              </h2>
            </div>

            <form className="space-y-4">
              <Input
                type="text"
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsTypingName(e.target.value.length > 0);
                }}
                onFocus={() => setIsTypingName(true)}
                onBlur={() => setIsTypingName(name.length === 0 ? false : true)}
                className="w-full"
                placeholder={session?.user?.name || "Enter your name"}
              />
            </form>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl leading-none">
                How should everyone call you?
              </h1>
              <h2 className="text-md text-title-secondary">
                This is the username people will use to call you.
              </h2>
            </div>

            <form className="space-y-4">
              <Input
                type="text"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsTypingUsername(e.target.value.length > 0);
                }}
                onFocus={() => setIsTypingUsername(true)}
                onBlur={() =>
                  setIsTypingUsername(username.length === 0 ? false : true)
                }
                className="w-full"
                placeholder={session?.user?.username || "Enter your username"}
              />
            </form>
          </div>
        );
    }
  }, [
    currentStep,
    name,
    username,
    session?.user?.name,
    session?.user?.username,
  ]);

  return (
    <main className="m-2.5 bg-background h-screen">
      <div className="bg-card rounded-3xl h-full pl-100  p-5 font-medium space-x-10 flex mx-auto justify-center items-center">
        <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
          <motion.div
            initial={false}
            animate={{
              height: bounds.height > 0 ? bounds.height : "auto",
            }}
            className="overflow-hidden w-[400px] shrink-0"
            style={{ willChange: "transform" }}
            transition={
              hasMeasured
                ? { duration: 0.5, type: "spring", bounce: 0 }
                : { duration: 0 }
            }
          >
            <div className="flex flex-col space-y-8 p-6" ref={ref}>
              <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={direction}
              >
                <motion.div
                  key={currentStep}
                  variants={variants}
                  initial="initial"
                  animate="active"
                  exit="exit"
                  custom={direction}
                  style={{ willChange: "transform" }}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
              <motion.div layout className="flex justify-between gap-4 ">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(-1);
                      setCurrentStep((prev) => prev - 1);
                    }}
                    className="py-2.5 px-5 rounded-2xl cursor-pointer font-medium text-[#63635d] border border-border bg-background hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 0) {
                      setDirection(1);
                      setCurrentStep(1);
                      return;
                    }
                    // Add logic for final step or continue to next step
                    setDirection(1);
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className={`py-2.5 px-5 rounded-2xl cursor-pointer  font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity ${
                    currentStep === 0 ? "w-full" : "ml-auto"
                  }`}
                >
                  {currentStep === 0
                    ? "Confirm my name"
                    : "Confirm my username"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </MotionConfig>
        <div className="relative">
          <div className="absolute -top-30 h-[400px] w-[calc(100%+550px)] bg-linear-to-b from-card from-40% to-transparent pointer-events-none z-10 " />
          <div className="absolute -bottom-90 h-[calc(100%+50px)] from-60% w-[calc(100%+550px)] bg-linear-to-t from-card to-transparent pointer-events-none z-10 " />
          <div className="absolute -right-130 w-[650px] h-[calc(100%+300px)]  bg-linear-to-l from-card from-70% to-transparent pointer-events-none z-10 " />

          {/* Profile Preview */}
          <motion.div
            initial={{ y: 0, scale: 1.1 }}
            animate={{
              y: isTypingUsername ? -100 : isTypingName ? 20 : 0,
              scale: isTypingUsername ? 1.8 : isTypingName ? 1.4 : 1.1,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
            }}
            style={{ transformOrigin: "left top" }}
            className="flex flex-col space-y-2  border border-border h-[520px] w-[640px]  p-6 "
          >
            <div className="space-y-2 space-x-4 grid grid-cols-[calc(50%-0.5px)_1px_calc(50%-0.5px)] flex-1">
              <div className="flex flex-col space-y-6 px-2 py-6">
                <div className="size-20 bg-border rounded-full skeleton" />
                <div className="flex flex-col space-y-1">
                  {name.trim() ? (
                    <p className="text-2xl text-title text-balance">
                      <AnimatePresence mode="popLayout">
                        {name.split("").map((letter, index) => (
                          <motion.span
                            key={`${letter}-${index}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{
                              duration: 0.1,
                              ease: "easeOut",
                            }}
                            style={{ display: "inline-block" }}
                          >
                            {letter === " " ? "\u00A0" : letter}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </p>
                  ) : (
                    <div className="h-7 w-48 bg-border rounded-md skeleton" />
                  )}
                  {username.trim() ? (
                    <p className="text-lg text-title-secondary text-balance leading-none">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key="@"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{
                            duration: 0.1,
                            ease: "easeOut",
                          }}
                          style={{ display: "inline-block" }}
                        >
                          @
                        </motion.span>
                        {username.split("").map((letter, index) => (
                          <motion.span
                            key={`${letter}-${index}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{
                              duration: 0.1,
                              ease: "easeOut",
                            }}
                            style={{ display: "inline-block" }}
                          >
                            {letter === " " ? "\u00A0" : letter}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </p>
                  ) : (
                    <div className="w-full h-5 bg-border rounded-sm skeleton" />
                  )}
                  <div className="w-full h-40 bg-border rounded-xl skeleton mt-5" />
                </div>
              </div>
              <div className="w-px h-full bg-border" />
              <div className="h-full "></div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
