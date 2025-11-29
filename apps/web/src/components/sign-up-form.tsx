"use client";

import { authClient } from "@lib/auth-client";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { motion, AnimatePresence } from "motion/react";
import Loader from "./loader";
import { Button } from "./ui/button";
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
      name: "",
      username: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          username: value.username,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
          onError: (error) => {
            // Error handling can be added here if needed
            console.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(30, "Username must be at most 30 characters")
          .regex(
            /^[a-zA-Z0-9_.]+$/,
            "Username can only contain letters, numbers, underscores, and dots",
          ),
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
            name="name"
            validators={{
              onChange: z
                .string()
                .min(1, "Name is required")
                .min(2, "Name must be at least 2 characters"),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground leading-none w-full px-3.75 py-3.25 rounded-2xl font-medium transition-colors focus:outline-none "
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Jane "
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
            name="username"
            validators={{
              onChange: z
                .string()
                .min(1, "Username is required")
                .min(3, "Username must be at least 3 characters")
                .max(30, "Username must be at most 30 characters")
                .regex(
                  /^[a-zA-Z0-9_.]+$/,
                  "Username can only contain letters, numbers, underscores, and dots",
                ),
            }}
          >
            {(field) => (
              <div>
                <motion.input
                  className="bg-background placeholder:text-muted-foreground leading-none w-full px-3.75 py-3.25 rounded-2xl font-medium transition-colors focus:outline-none "
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="jane_doe"
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
            const isNameEmpty =
              !state.values.name || state.values.name.trim() === "";
            const isUsernameEmpty =
              !state.values.username || state.values.username.trim() === "";
            const isEmailEmpty =
              !state.values.email || state.values.email.trim() === "";
            const isPasswordEmpty =
              !state.values.password || state.values.password.trim() === "";
            const isDisabled =
              state.isSubmitting ||
              isNameEmpty ||
              isUsernameEmpty ||
              isEmailEmpty ||
              isPasswordEmpty;

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
                        Sign up
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
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="h-auto p-0 text-primary cursor-pointer underline-offset-4 hover:underline"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
