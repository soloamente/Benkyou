"use client";

import { useState, useRef, useEffect } from "react";
import { type DeckDisplaySettings } from "@/lib/deck-settings-api";

// Check icon for selected items
function IconCheck({ size = 14, strokeWidth = 3, className = "" }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Plus icon for custom color picker
function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Chevron down icon
function IconChevronDown({ size = 14, strokeWidth = 3.5, className = "" }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Available theme colors
const THEME_COLORS = [
  { id: "dark", color: null, label: "Dark" }, // Uses card background
  { id: "primary", color: "var(--color-primary)", label: "Primary" },
  { id: "black", color: "#14120B", label: "Black" },
];

// Available target word colors
const TARGET_WORD_COLORS = [
  { id: "blue", color: "#4FB4FF", label: "Blue" },
  { id: "cream", color: "#EFE7DE", label: "Cream" },
];

// Available fonts (Japanese-friendly)
const FONTS = [
  "Rounded Mplus 1c",
  "Noto Sans JP",
  "M PLUS 1p",
  "Kosugi Maru",
  "Sawarabi Gothic",
  "Source Han Sans",
];

interface DisplayControlsProps {
  displaySettings: DeckDisplaySettings;
  onSettingsChange: (settings: Partial<DeckDisplaySettings>) => void;
}

export function DisplayControls({
  displaySettings,
  onSettingsChange,
}: DisplayControlsProps) {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [customThemeColor, setCustomThemeColor] = useState<string | null>(null);
  const [customTargetColor, setCustomTargetColor] = useState<string | null>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // Close font dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if a theme is selected
  const isThemeSelected = (themeId: string) => {
    if (themeId === "dark") {
      return displaySettings.theme === "dark";
    }
    const theme = THEME_COLORS.find(t => t.id === themeId);
    return theme?.color === displaySettings.theme;
  };

  // Check if a target word color is selected
  const isTargetColorSelected = (colorId: string) => {
    const color = TARGET_WORD_COLORS.find(c => c.id === colorId);
    return color?.color === displaySettings.targetWordColor;
  };

  // Handle theme selection
  const handleThemeSelect = (themeId: string) => {
    if (themeId === "dark") {
      onSettingsChange({ theme: "dark" });
    } else {
      const theme = THEME_COLORS.find(t => t.id === themeId);
      if (theme?.color) {
        onSettingsChange({ theme: theme.color });
      }
    }
  };

  // Handle custom theme color
  const handleCustomThemeColor = (color: string) => {
    setCustomThemeColor(color);
    onSettingsChange({ theme: color });
  };

  // Handle target word color selection
  const handleTargetColorSelect = (colorId: string) => {
    const color = TARGET_WORD_COLORS.find(c => c.id === colorId);
    if (color) {
      onSettingsChange({ targetWordColor: color.color });
    }
  };

  // Handle custom target word color
  const handleCustomTargetColor = (color: string) => {
    setCustomTargetColor(color);
    onSettingsChange({ targetWordColor: color });
  };

  // Handle font size change via drag
  const handleFontSizeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = displaySettings.fontSize;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newValue = Math.max(12, Math.min(48, startValue + Math.round(deltaX / 5)));
      onSettingsChange({ fontSize: newValue });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle font weight change via drag
  const handleFontWeightDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startValue = displaySettings.fontWeight;
    const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const currentIndex = weights.indexOf(startValue) !== -1 ? weights.indexOf(startValue) : 4;
      const newIndex = Math.max(0, Math.min(weights.length - 1, currentIndex + Math.round(deltaX / 20)));
      onSettingsChange({ fontWeight: weights[newIndex] });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex gap-auto w-full justify-between shrink-0">
      {/* Deck Theme selector */}
      <div className="bg-card w-fit h-fit flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
        <span className="text-sm">Deck Theme</span>
        <div className="flex gap-1.25">
          {THEME_COLORS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px] transition-transform duration-200 ease hover:scale-105"
              aria-label={theme.label}
            >
              <div 
                className={`rounded-full w-full h-full flex items-center justify-center ${
                  theme.id === "dark" ? "bg-card" : ""
                } ${theme.id === "primary" ? "bg-primary" : ""}`}
                style={theme.color && theme.id !== "primary" ? { backgroundColor: theme.color } : undefined}
              >
                {isThemeSelected(theme.id) && (
                  <IconCheck size={14} strokeWidth={3} />
                )}
              </div>
            </button>
          ))}
          {/* Custom color picker */}
          <label className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
            <div className="rounded-full bg-gradient-to-t from-card to-primary w-full h-full flex items-center justify-center">
              <IconPlus className="opacity-70" />
            </div>
            <input
              type="color"
              className="sr-only"
              value={customThemeColor || displaySettings.theme}
              onChange={(e) => handleCustomThemeColor(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Target Word Color selector */}
      <div className="bg-card w-fit flex h-fit items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
        <span className="text-sm">Target Word Color</span>
        <div className="flex gap-1.25">
          {TARGET_WORD_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleTargetColorSelect(color.id)}
              className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px] transition-transform duration-200 ease hover:scale-105"
              aria-label={color.label}
            >
              <div 
                className="rounded-full w-full h-full flex items-center justify-center"
                style={{ backgroundColor: color.color }}
              >
                {isTargetColorSelected(color.id) && (
                  <IconCheck size={14} strokeWidth={3} />
                )}
              </div>
            </button>
          ))}
          {/* Custom color picker */}
          <label className="flex flex-col cursor-pointer rounded-full bg-background p-1.25 w-[30px] h-[30px]">
            <div className="rounded-full bg-gradient-to-t from-card to-primary w-full h-full flex items-center justify-center">
              <IconPlus className="opacity-70" />
            </div>
            <input
              type="color"
              className="sr-only"
              value={customTargetColor || displaySettings.targetWordColor}
              onChange={(e) => handleCustomTargetColor(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* Font selector */}
      <div className="bg-card w-fit flex h-fit items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
        <span className="text-sm">Font</span>
        <div className="flex gap-1.25 relative" ref={fontDropdownRef}>
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className="flex cursor-pointer text-sm rounded-full items-center bg-background px-3.25 py-2 w-fit leading-none gap-3.75 hover:bg-background/80 transition-colors duration-200 ease"
          >
            {displaySettings.fontFamily}
            <IconChevronDown
              size={14}
              strokeWidth={3.5}
              className="opacity-40"
            />
          </button>
          {/* Font dropdown */}
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-card rounded-2xl shadow-lg z-50 min-w-[200px] py-2 overflow-hidden">
              {FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    onSettingsChange({ fontFamily: font });
                    setShowFontDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-background/50 transition-colors duration-200 ease ${
                    displaySettings.fontFamily === font ? "bg-background/30" : ""
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-card w-fit flex h-fit items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
        <span className="text-sm">Font Size</span>
        <div className="flex gap-1.25">
          <div
            onMouseDown={handleFontSizeDrag}
            className="flex cursor-ew-resize text-sm rounded-full items-center bg-background px-2 py-2 w-fit leading-none gap-3.75 select-none"
            title="Drag left/right to adjust"
          >
            {displaySettings.fontSize}
          </div>
        </div>
      </div>

      {/* Font Weight */}
      <div className="bg-card w-fit flex h-fit items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none">
        <span className="text-sm">Font Weight</span>
        <div className="flex gap-1.25">
          <div
            onMouseDown={handleFontWeightDrag}
            className="flex cursor-ew-resize text-sm rounded-full items-center bg-background px-2 py-2 w-fit leading-none gap-3.75 select-none"
            title="Drag left/right to adjust"
          >
            {displaySettings.fontWeight}
          </div>
        </div>
      </div>
    </div>
  );
}

