"use client";

import { authClient } from "@lib/auth-client";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { motion, AnimatePresence } from "motion/react";
import Loader from "./loader";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // Generate a temporary username that will be updated during onboarding
      // Better Auth requires username to be at least 3 characters and match /^[a-zA-Z0-9_.]+$/
      // Use email prefix + timestamp to ensure uniqueness
      const emailPrefix =
        value.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "") || "user";
      const timestamp = Date.now().toString().slice(-8); // Last 8 digits for uniqueness
      const tempUsername = `${emailPrefix}_${timestamp}`.slice(0, 30); // Max 30 chars, min 3+ guaranteed

      try {
        await authClient.signUp.email(
          {
            email: value.email,
            password: value.password,
            name: "", // Will be set during onboarding
            username: tempUsername, // Temporary username, will be updated during onboarding
          },
          {
            onSuccess: async () => {
              // Wait a bit for the session to be established
              await new Promise((resolve) => setTimeout(resolve, 100));
              // Refresh session to ensure it's up to date
              await authClient.getSession();
              router.replace("/onboarding");
            },
            onError: (error) => {
              // Error handling can be added here if needed
              console.error(
                "Sign up error:",
                error.error.message || error.error.statusText
              );
            },
          }
        );
      } catch (error) {
        console.error("Unexpected sign up error:", error);
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-center text-3xl font-bold">Create Account</h1>
        {/* <h2 className="text-center text-sm text-muted-foreground">
          Create your account to get started
        </h2> */}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-3"
      >
        <div>
          <form.Field
            name="email"
            validators={{
              onChange: z
                .string()
                .min(1, "Email is required")
                .email("Invalid email address"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground leading-none w-full px-3.75 py-3.25 rounded-2xl font-medium transition-colors focus:outline-none "
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="jane@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-red-500 text-sm"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="password"
            validators={{
              onChange: z
                .string()
                .min(1, "Password is required")
                .min(8, "Password must be at least 8 characters"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground leading-none w-full px-3.75 py-3.25 rounded-2xl font-medium transition-colors focus:outline-none "
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="jane123"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  style={{ willChange: "transform" }}
                />
                <AnimatePresence mode="wait">
                  {field.state.meta.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-red-500 text-sm"
                      >
                        {field.state.meta.errors[0]?.message}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => {
            const isEmailEmpty =
              !state.values.email || state.values.email.trim() === "";
            const isPasswordEmpty =
              !state.values.password || state.values.password.trim() === "";
            const isDisabled =
              state.isSubmitting || isEmailEmpty || isPasswordEmpty;

            return (
              <motion.button
                type="submit"
                className="w-full bg-primary cursor-pointer text-primary-foreground transition-opacity duration-300 hover:bg-primary/90 px-4 py-2.75 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.01 } : undefined}
                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                transition={{ duration: 0.2 }}
                style={{ willChange: "transform" }}
              >
                <div className="h-5 flex items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {state.isSubmitting ? (
                      <motion.div
                        key="spinner"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                      >
                        <Spinner
                          size="sm"
                          className="text-primary-foreground"
                        />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="leading-none"
                      >
                        Create my account
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          }}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="h-auto p-0 text-primary cursor-pointer underline-offset-4 hover:underline bg-transparent border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}
