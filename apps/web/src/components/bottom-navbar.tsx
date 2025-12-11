"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@lib/utils";
import { authClient } from "@lib/auth-client";

// Navigation items configuration
const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/stats",
    icon: BarChart3,
    label: "Stats",
  },
  {
    href: "/study",
    icon: BookOpen,
    label: "Study",
  },
] as const;

export function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  // Don't render if no session
  if (!session?.user) {
    return null;
  }

  // Get user avatar or fallback
  const userImage = session.user.image;
  const userName = session.user.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Check if current path matches a nav item
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/dashboard" || pathname?.startsWith("/dashboard/decks")
      );
    }
    return pathname === href;
  };

  // Handle navigation click
  const handleNavClick = (href: string) => {
    router.push(href as any); // Type assertion needed for typed routes
  };

  // Handle avatar click (could navigate to profile/settings)
  const handleAvatarClick = () => {
    // For now, just navigate to dashboard
    // You can change this to navigate to a profile/settings page later
    router.push("/dashboard" as any); // Type assertion needed for typed routes
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-fit"
    >
      <div className="bg-background border-2 border-border flex items-center justify-between gap-2 rounded-full px-1.5 py-1.5 ">
        <div className="flex items-center justify-between gap-2">
          {/* User Avatar - First Item */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarClick}
            className={cn(
              "relative shrink-0 size-8 rounded-full overflow-hidden",
              "bg-primary/10 border-2 border-border",
              "flex items-center justify-center",
              "transition-colors hover:bg-primary/20"
            )}
            aria-label="User profile"
          >
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {userInitials}
              </span>
            )}
          </motion.button>
          <div className="w-px h-full bg-card" />
          {/* Navigation Icons */}
          <div className="flex items-center gap-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.button
                  key={item.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "relative flex items-center justify-center cursor-pointer",
                    "size-8 rounded-full",
                    "transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-title-secondary hover:bg-accent hover:text-title"
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" />
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full bg-primary -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Spacer to balance the layout */}
          <div className="size-8 shrink-0" />
        </div>
      </div>
    </motion.nav>
  );
}
