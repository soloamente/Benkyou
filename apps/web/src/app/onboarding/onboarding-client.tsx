"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { authClient } from "@lib/auth-client";
import { cn } from "@lib/utils";
import IconVShapedArrowLeftOutlineDuo18 from "@components/icons/v-shaped-arrow-left";
import Cards from "@components/cards";
// Removed OnboardingPrompt import - prompt is now step 0
import {
  getOnboardingStatus,
  completeOnboarding,
  skipOnboarding,
  type OnboardingData,
} from "@lib/onboarding-api";
import { useRouter } from "next/navigation";

const variants = {
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};

interface OnboardingPageProps {
  session: typeof authClient.$Infer.Session;
}

export default function OnboardingClient({ session }: OnboardingPageProps) {
  const router = useRouter();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [hasChosenToSetup, setHasChosenToSetup] = useState(false);
  const [isTypingName, setIsTypingName] = useState(false);
  const [isTypingUsername, setIsTypingUsername] = useState(false);
  const [isFocusedUsername, setIsFocusedUsername] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState(session?.user?.name ?? "");
  const [username, setUsername] = useState(session?.user?.username ?? "");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [isTypingBio, setIsTypingBio] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [ref, bounds] = useMeasure();
  const [hasMeasured, setHasMeasured] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getOnboardingStatus();
        console.log("Onboarding status:", status);
        if (status.onboardingCompleted) {
          // If already completed, skip the prompt step and go directly to step 1 (avatar)
          // User can update their profile
          setHasChosenToSetup(true);
          setCurrentStep(1);
        } else {
          // If not completed, start at step 0 (the prompt step)
          setCurrentStep(0);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If there's an error, allow access anyway
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, []);

  // Handle prompt "now" - proceed with onboarding
  const handleProceed = () => {
    setHasChosenToSetup(true);
    setCurrentStep(1); // Move to avatar step
    setDirection(1);
  };

  // Handle prompt "later" - skip onboarding
  const handleSkip = async () => {
    if (isSkipping) return; // Prevent multiple clicks

    setIsSkipping(true);
    try {
      // Mark onboarding as skipped/completed so user can access dashboard
      const response = await skipOnboarding();
      if (response.success) {
        router.push("/dashboard");
      } else {
        console.error("Failed to skip onboarding:", response.error);
        // Still redirect to dashboard even if API call fails
        // (fail open - better UX than blocking access)
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      // Still redirect to dashboard even if there's an error
      // (fail open - better UX than blocking access)
      router.push("/dashboard");
    } finally {
      setIsSkipping(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const onboardingData: OnboardingData = {
        name: name.trim(),
        username: username.trim(),
        avatar: avatar ? avatar : undefined,
        goals: selectedGoals,
        bio: bio.trim(),
      };

      const response = await completeOnboarding(onboardingData);

      if (response.success) {
        // Redirect to dashboard on success
        router.push("/dashboard");
      } else {
        // Handle error
        console.error("Failed to complete onboarding:", response.error);
        alert(
          response.error || "Failed to complete onboarding. Please try again."
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const availableGoals = [
    "Study a subject",
    "Learn a language",
    "Prepare for exams",
    "Memorize vocabulary",
    "Practice reading",
    "Other",
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Handle avatar file selection
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatar(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Handle drag and drop for avatar
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (bounds.height > 0 && !hasMeasured) {
      setHasMeasured(true);
    }
  }, [bounds.height, hasMeasured]);

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        // First step: Ask if user wants to set up profile now or later
        return (
          <div className="flex flex-col space-y-12">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold leading-none">
                Let's set up your profile
              </h1>
              <h2 className="text-md text-title-secondary text-pretty">
                Complete your profile to join the community and share
                content.{" "}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleProceed}
                className="w-full py-3 cursor-pointer rounded-2xl font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
              >
                Set up now
              </button>
              <button
                onClick={handleSkip}
                disabled={isSkipping}
                className="w-full py-3 cursor-pointer rounded-2xl font-medium border border-border bg-background hover:bg-border/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSkipping ? "Okay, do it later then..." : "Maybe later"}
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl leading-none font-bold">
                Add your avatar
              </h1>
              <h2 className="text-md text-title-secondary">
                Upload a photo to personalize your profile.
              </h2>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {avatarPreview ? (
                  <motion.div
                    key="avatar-preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                    }}
                    className="relative w-32 h-32 rounded-full overflow-hidden mx-auto group cursor-pointer"
                  >
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-white text-sm font-medium">
                        Change
                      </span>
                    </div>
                    <div className="absolute inset-0 border-2 border-white/50 rounded-full opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-105 transition-all duration-300 pointer-events-none" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="avatar-upload"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="avatar-upload-area"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.2,
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="relative border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-primary transition-colors cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="avatar-upload"
                    />
                    <div className="size-20 bg-border rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-title-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm text-title">
                        Drag and drop an image here
                      </p>
                      <p className="text-xs text-title-secondary">
                        or click to browse
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl leading-none font-bold">
                What's your name?
              </h1>
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
      case 3:
        return (
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl leading-none font-bold ">
                How would you like to be called?
              </h1>
              <h2 className="text-md text-title-secondary">
                This is the username people will use to find you.
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
                onFocus={() => {
                  setIsTypingUsername(true);
                  setIsFocusedUsername(true);
                }}
                onBlur={() =>
                  setIsTypingUsername(username.length === 0 ? false : true)
                }
                className="w-full"
                placeholder={session?.user?.username || "Enter your username"}
              />
            </form>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl leading-none font-bold">
                What are your goals?
              </h1>
              <h2 className="text-md text-title-secondary">
                Select what you plan to use this app for.
              </h2>
            </div>

            <div className="space-y-3">
              {availableGoals.map((goal) => (
                <motion.button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  initial={false}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                  }}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-left font-medium border-2 cursor-pointer",
                    selectedGoals.includes(goal)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-title hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{goal}</span>
                    <AnimatePresence mode="wait">
                      {selectedGoals.includes(goal) && (
                        <motion.svg
                          key="checkmark"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 0.15,
                            ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                          }}
                          className="w-5 h-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl leading-none font-bold">
                Tell us about yourself
              </h1>
              <h2 className="text-md text-title-secondary">
                Add a bio to help others get to know you better.
              </h2>
            </div>

            <form className="space-y-4">
              <Textarea
                name="bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setIsTypingBio(true);
                }}
                onFocus={() => setIsTypingBio(true)}
                onBlur={() => setIsTypingBio(bio.length === 0 ? false : true)}
                className="w-full min-h-[120px] resize-none rounded-2xl py-3 px-4 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Write a short bio about yourself..."
              />
            </form>
          </div>
        );
    }
  }, [
    currentStep,
    name,
    username,
    avatarPreview,
    selectedGoals,
    bio,
    availableGoals,
    session?.user?.name,
    session?.user?.username,
    handleAvatarChange,
    handleDrop,
    handleDragOver,
    toggleGoal,
    handleProceed,
    handleSkip,
  ]);

  // Show loading state while checking status
  if (isCheckingStatus) {
    return (
      <main className="m-2.5 bg-background h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="m-2.5 bg-background h-screen">
      <div className="bg-card rounded-3xl h-full pl-100 overflow-hidden p-5 font-medium space-x-10 flex mx-auto justify-center items-center">
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
              {/* Navigation buttons - hidden on step 0 (prompt step) */}
              {currentStep > 0 && (
                <motion.div layout className="flex justify-between gap-4 ">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDirection(-1);
                        setCurrentStep((prev) => prev - 1);
                      }}
                      className="py-2.5 pr-5 pl-3 flex items-center gap-1 rounded-2xl cursor-pointer font-medium text-[#63635d] border border-border bg-background hover:text-foreground transition-colors"
                    >
                      <IconVShapedArrowLeftOutlineDuo18 strokeWidth={2} /> Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep < 5) {
                        setDirection(1);
                        setCurrentStep((prev) => prev + 1);
                      } else {
                        // Final step - handle submission
                        handleSubmit();
                      }
                    }}
                    disabled={
                      isSubmitting ||
                      (currentStep === 1 && !avatar) ||
                      (currentStep === 2 && !name.trim()) ||
                      (currentStep === 3 && !username.trim()) ||
                      (currentStep === 4 && selectedGoals.length === 0)
                    }
                    className={`py-2.5 px-5 rounded-2xl cursor-pointer font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentStep === 1 ? "w-full" : "ml-auto"
                    }`}
                  >
                    {currentStep === 1
                      ? "Confirm my avatar"
                      : currentStep === 2
                        ? "Confirm my name"
                        : currentStep === 3
                          ? "Confirm my username"
                          : currentStep === 4
                            ? "Confirm my goals"
                            : isSubmitting
                              ? "Saving..."
                              : "Complete setup"}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </MotionConfig>
        {/* Profile Preview */}
        <div className="relative">
          <div
            className={cn(
              "absolute h-[400px] w-[calc(100%+550px)] transition-all duration-300 bg-linear-to-b from-card to-transparent pointer-events-none z-10 ",
              currentStep === 0 ? "from-50%" : "from-50%",
              currentStep === 1 && avatar ? "from-60%" : "-top-40",
              (currentStep === 4 && selectedGoals.length > 0) ||
                currentStep === 3 ||
                currentStep === 5
                ? "-top-65"
                : "-top-50"
            )}
          />
          <div className="absolute -bottom-90 h-[calc(100%+50px)] from-60% w-[calc(100%+550px)] bg-linear-to-t from-card to-transparent pointer-events-none z-10 " />
          <div
            className={cn(
              "absolute -right-130 w-[650px] h-[calc(100%+300px)]  bg-linear-to-l from-card from-70% to-transparent pointer-events-none z-10 ",
              currentStep === 5 ? "from-00%" : "from-70%"
            )}
          />

          {/* Profile Preview */}
          <motion.div
            initial={{ y: 0, scale: 1.1 }}
            animate={{
              y:
                currentStep === 0
                  ? 0 // Prompt step - no animation
                  : currentStep === 1
                    ? avatar
                      ? 60
                      : 0
                    : currentStep === 2
                      ? isTypingName
                        ? -15
                        : 0
                      : currentStep === 3
                        ? isTypingUsername
                          ? -200
                          : 0
                        : currentStep === 4
                          ? selectedGoals.length > 0
                            ? -250
                            : -40
                          : currentStep === 5
                            ? isTypingBio
                              ? -485
                              : -60
                            : 0,
              scale:
                currentStep === 0
                  ? 1.1 // Prompt step - default scale
                  : currentStep === 1
                    ? avatar
                      ? 2
                      : 1.1
                    : currentStep === 2
                      ? isTypingName
                        ? 1.6
                        : 1.1
                      : currentStep === 3
                        ? isTypingUsername
                          ? 2
                          : 1.1
                        : currentStep === 4
                          ? selectedGoals.length > 0
                            ? 1.8
                            : 1.1
                          : currentStep === 5
                            ? isTypingBio
                              ? 2.2
                              : 1.3
                            : 1.1,
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
            }}
            style={{ transformOrigin: "left top" }}
            className="flex flex-col space-y-2 rounded-3xl border border-border h-[520px] w-[640px]  p-6 "
          >
            <div className="space-y-2 space-x-4 grid grid-cols-[calc(50%-0.5px)_1px_calc(50%-0.5px)] flex-1">
              <div className="flex flex-col space-y-6 px-2 py-6">
                {avatarPreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "size-20 rounded-full overflow-hidden transition-opacity duration-400 ease-in-out",
                      currentStep === 1 ? "opacity-100" : "opacity-10"
                    )}
                  >
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="avatar-skeleton"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                      }}
                      className={cn(
                        "size-20 bg-border rounded-full skeleton transition-opacity duration-400 ease-in-out",
                        currentStep === 5 ? "opacity-100" : "opacity-30"
                      )}
                    />
                  </AnimatePresence>
                )}
                <div className="flex flex-col space-y-1">
                  {name.trim() ? (
                    <p
                      className={cn(
                        "text-2xl text-balance text-title transition-opacity leading-tight duration-400 ease-in-out",
                        currentStep === 2 ? "opacity-100" : "opacity-10"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {name
                          .split(/(\s+)/)
                          .map((segment, segmentIndex, segments) => {
                            // Skip empty strings from split
                            if (!segment) return null;

                            // If it's whitespace, attach it to the previous word to prevent leading spaces
                            if (/^\s+$/.test(segment)) {
                              // Find the previous word segment
                              const prevWordIndex = segmentIndex - 1;
                              if (
                                prevWordIndex >= 0 &&
                                segments[prevWordIndex]
                              ) {
                                // Attach space to previous word by returning null here
                                // and handling it in the word rendering
                                return null;
                              }
                              // If no previous word, render space normally
                              return (
                                <span
                                  key={`name-space-${segmentIndex}`}
                                  style={{ whiteSpace: "pre" }}
                                >
                                  {segment}
                                </span>
                              );
                            }

                            // For words, check if there's a space after this word
                            const nextSegment = segments[segmentIndex + 1];
                            const hasSpaceAfter =
                              nextSegment && /^\s+$/.test(nextSegment);

                            // For words, wrap in a span to keep letters together
                            // Include the following space in the span to prevent leading spaces on wrap
                            return (
                              <span
                                key={`name-word-${segmentIndex}`}
                                style={{
                                  display: "inline-block",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {segment
                                  .split("")
                                  .map((letter, letterIndex) => (
                                    <motion.span
                                      key={`name-${segmentIndex}-${letterIndex}`}
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      transition={{
                                        duration: 0.1,
                                        ease: "easeOut",
                                      }}
                                      style={{ display: "inline-block" }}
                                    >
                                      {letter}
                                    </motion.span>
                                  ))}
                                {hasSpaceAfter && (
                                  <span style={{ whiteSpace: "pre" }}>
                                    {nextSegment}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                      </AnimatePresence>
                    </p>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="name-skeleton"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                        }}
                        className="h-7 w-48 bg-border rounded-md skeleton"
                      />
                    </AnimatePresence>
                  )}
                  {username.trim() ? (
                    <p
                      className={cn(
                        "text-lg text-balance leading-none transition-opacity duration-400 ease-in-out",
                        currentStep === 3 ? "opacity-100" : "opacity-10"
                      )}
                    >
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
                        {username.split(/(\s+)/).map((word, wordIndex) => {
                          // Skip empty strings from split
                          if (!word) return null;

                          // If it's whitespace, render as is
                          if (/^\s+$/.test(word)) {
                            return (
                              <span
                                key={`username-space-${wordIndex}`}
                                style={{ whiteSpace: "pre" }}
                              >
                                {word}
                              </span>
                            );
                          }

                          // For words, wrap in a span to keep letters together
                          return (
                            <span
                              key={`username-word-${wordIndex}`}
                              style={{
                                display: "inline-block",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {word.split("").map((letter, letterIndex) => (
                                <motion.span
                                  key={`username-${wordIndex}-${letterIndex}`}
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={{
                                    duration: 0.1,
                                    ease: "easeOut",
                                  }}
                                  style={{ display: "inline-block" }}
                                >
                                  {letter}
                                </motion.span>
                              ))}
                            </span>
                          );
                        })}
                      </AnimatePresence>
                    </p>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="username-skeleton"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                        }}
                        className="w-full h-5 bg-border rounded-sm skeleton"
                      />
                    </AnimatePresence>
                  )}
                  {selectedGoals.length > 0 ? (
                    <div
                      className={cn(
                        "flex flex-wrap gap-1.5 mt-4 transition-opacity duration-400 ease-in-out",
                        currentStep === 4 ? "opacity-100" : "opacity-10"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {selectedGoals.map((goal) => (
                          <motion.div
                            key={goal}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              duration: 0.2,
                              ease: "easeOut",
                            }}
                            className="px-2 py-1 truncate text-xs leading-none font-medium rounded-md bg-primary/10 text-primary border border-primary/20"
                          >
                            {goal}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key="goals-skeleton-container"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                          visible: {
                            transition: {
                              staggerChildren: 0.1,
                            },
                          },
                          hidden: {
                            transition: {
                              staggerChildren: 0.03,
                              staggerDirection: -1,
                            },
                          },
                        }}
                        className={cn(
                          "flex flex-wrap gap-1.5 mt-2 transition-opacity duration-400 ease-in-out bg-transparent",
                          currentStep === 5 ? "opacity-100" : "opacity-30"
                        )}
                      >
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={`goals-skeleton-${i}`}
                            variants={{
                              visible: {
                                opacity: 1,
                                scale: 1,
                              },
                              hidden: {
                                opacity: 0,
                                scale: 0.8,
                              },
                            }}
                            transition={{
                              duration: 0.2,
                              ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                            }}
                            className="h-6 w-20 bg-border rounded-md skeleton"
                          />
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  )}
                  {bio.trim() ? (
                    <div
                      className={cn(
                        "w-full min-h-[160px] mt-5 rounded-xl transition-opacity duration-400 ease-in-out",
                        currentStep === 5 ? "opacity-100" : "opacity-10"
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium text-title-secondary/70 transition-opacity duration-400 ease-in-out uppercase tracking-wider",
                          currentStep === 5 ? "opacity-100" : "opacity-10"
                        )}
                      >
                        <AnimatePresence mode="popLayout">
                          {"BIO".split("").map((letter, index) => (
                            <motion.span
                              key={`bio-label-${letter}-${index}`}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{
                                duration: 0.1,
                                ease: "easeOut",
                                delay: index * 0.05,
                              }}
                              style={{ display: "inline-block" }}
                            >
                              {letter}
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </p>
                      <div className="text-sm text-title text-balance hyphens-auto w-full">
                        <AnimatePresence mode="popLayout">
                          {bio
                            .split(/(\s+)/)
                            .map((segment, segmentIndex, segments) => {
                              // Skip empty strings from split
                              if (!segment) return null;

                              // If it's whitespace, attach it to the previous word to prevent leading spaces
                              if (/^\s+$/.test(segment)) {
                                // Find the previous word segment
                                const prevWordIndex = segmentIndex - 1;
                                if (
                                  prevWordIndex >= 0 &&
                                  segments[prevWordIndex]
                                ) {
                                  // Attach space to previous word by returning null here
                                  // and handling it in the word rendering
                                  return null;
                                }
                                // If no previous word, render space normally
                                return (
                                  <span
                                    key={`bio-space-${segmentIndex}`}
                                    style={{ whiteSpace: "pre" }}
                                  >
                                    {segment}
                                  </span>
                                );
                              }

                              // For words, check if there's a space after this word
                              const nextSegment = segments[segmentIndex + 1];
                              const hasSpaceAfter =
                                nextSegment && /^\s+$/.test(nextSegment);

                              // For words, wrap in a span to keep letters together
                              // Include the following space in the span to prevent leading spaces on wrap
                              return (
                                <span
                                  key={`bio-word-${segmentIndex}`}
                                  style={{
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {segment
                                    .split("")
                                    .map((letter, letterIndex) => (
                                      <motion.span
                                        key={`bio-${segmentIndex}-${letterIndex}`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{
                                          duration: 0.1,
                                          ease: "easeOut",
                                        }}
                                        style={{ display: "inline-block" }}
                                      >
                                        {letter}
                                      </motion.span>
                                    ))}
                                  {hasSpaceAfter && (
                                    <span style={{ whiteSpace: "pre" }}>
                                      {nextSegment}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="bio-skeleton"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad
                        }}
                        className="w-full h-40 bg-border rounded-xl skeleton mt-5"
                      />
                    </AnimatePresence>
                  )}
                </div>
              </div>
              <div className="w-px h-full bg-border rounded-full" />
              <div className="h-full "></div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
