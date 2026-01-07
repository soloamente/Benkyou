"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, BarChart3, BookOpen } from "lucide-react";
import { cn } from "@lib/utils";
import { authClient } from "@lib/auth-client";
import IconHome from "@icons/home";

// Navigation items configuration
const navItems = [
  {
    href: "/decks",
    icon: IconHome,
    label: "Decks",
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
    if (href === "/decks") {
      return pathname === "/decks" || pathname?.startsWith("/decks");
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
    router.push("/decks" as any); // Type assertion needed for typed routes
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
      <div className="flex items-center justify-between gap-2 rounded-full px-1.5 py-1.5 ">
        <div className="flex items-center justify-between gap-2">
          {/* User Avatar - First Item */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarClick}
            className={cn(
              "relative shrink-0 size-8 rounded-full overflow-hidden cursor-pointer",
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
          <div className="flex items-center justify-center">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <motion.button
                  key={item.href}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "relative flex bg-[#212121] items-center justify-center w-fit text-sm cursor-pointer px-5 py-2.5 leading-none",
                    "rounded-full",
                    "transition-colors",
                    active
                      ? "bg-background text-primary"
                      : "text-title-secondary hover:bg-accent hover:text-title"
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
