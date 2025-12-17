"use client";

import { type DeckDisplaySettings, type NoteTypeField } from "@/lib/deck-settings-api";

// Sample data for preview (Japanese language learning example)
const SAMPLE_CARD_DATA: Record<string, string> = {
  "Target Word": "写真を撮った",
  "Sentence": "俺はスマホで写真を撮った",
  "Reading": "しゃしん|撮|と",  // Format: reading parts separated by |
  "Definition": "Take a photo",
  "Target Word Audio": "/audio/sample.mp3",
  "Sentence Audio": "/audio/sample-sentence.mp3",
  "Image": "/images/sample-camera.png",
  "Frequency": "1500",
  // Default values for custom fields
  "Front Field 1": "Sample Front Field",
  "Back Field 1": "Sample Back Field",
};

interface CardPreviewProps {
  side: "front" | "back";
  fields: NoteTypeField[];
  displaySettings: DeckDisplaySettings;
  onToggleSide: () => void;
}

export function CardPreview({
  side,
  fields,
  displaySettings,
  onToggleSide,
}: CardPreviewProps) {
  // Render a field based on its type
  const renderField = (field: NoteTypeField, index: number) => {
    const value = SAMPLE_CARD_DATA[field.name] || `[${field.name}]`;
    const isFirstTextField = field.type === "text" && index === 0;

    switch (field.type) {
      case "text":
        return (
          <div key={`${field.name}-${index}`} className="relative">
            {/* Field number indicator */}
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            <p
              className={isFirstTextField ? "text-3xl" : "text-xl"}
              style={{
                color: isFirstTextField ? displaySettings.targetWordColor : "inherit",
                fontFamily: displaySettings.fontFamily,
                fontSize: isFirstTextField ? `${displaySettings.fontSize * 2}px` : `${displaySettings.fontSize}px`,
                fontWeight: displaySettings.fontWeight,
              }}
            >
              {value}
            </p>
          </div>
        );

      case "reading":
        // Render text with furigana (reading annotations)
        return (
          <div key={`${field.name}-${index}`} className="relative">
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            <div 
              className="flex items-center gap-0.5 text-2xl"
              style={{
                fontFamily: displaySettings.fontFamily,
                fontWeight: displaySettings.fontWeight,
              }}
            >
              <ruby style={{ color: displaySettings.targetWordColor }}>
                写真
                <rt className="text-xs">しゃしん</rt>
              </ruby>
              <span>を</span>
              <ruby style={{ color: displaySettings.targetWordColor }}>
                撮
                <rt className="text-xs">と</rt>
              </ruby>
              <span>った</span>
            </div>
          </div>
        );

      case "audio":
        return (
          <div key={`${field.name}-${index}`} className="relative flex items-center gap-2">
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            {/* Audio indicator icon */}
            <button 
              className="w-8 h-8 rounded-full bg-title-secondary/20 flex items-center justify-center hover:bg-title-secondary/30 transition-colors duration-200 ease"
              aria-label={`Play ${field.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-sm text-title-secondary/60">{field.name}</span>
          </div>
        );

      case "image":
        return (
          <div key={`${field.name}-${index}`} className="relative">
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            {/* Placeholder image */}
            <div className="w-32 h-32 rounded-lg bg-title-secondary/10 flex items-center justify-center overflow-hidden">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-30">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          </div>
        );

      case "number":
        return (
          <div key={`${field.name}-${index}`} className="relative flex items-center gap-2">
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            <span className="text-sm text-title-secondary/60">
              {field.name}: {value}
            </span>
          </div>
        );

      default:
        return (
          <div key={`${field.name}-${index}`} className="relative">
            <span className="absolute -left-6 -top-1 text-xs text-title-secondary/50">
              {index + 1}
            </span>
            <p 
              style={{ 
                fontFamily: displaySettings.fontFamily,
                fontSize: `${displaySettings.fontSize}px`,
                fontWeight: displaySettings.fontWeight,
              }}
            >
              {value}
            </p>
          </div>
        );
    }
  };

  // Get theme background class
  const getThemeBackground = () => {
    if (displaySettings.theme === "dark") {
      return "bg-card";
    } else if (displaySettings.theme === "light") {
      return "bg-white";
    } else {
      // Custom color - use as background
      return "";
    }
  };

  const customBackgroundStyle = 
    displaySettings.theme !== "dark" && displaySettings.theme !== "light"
      ? { backgroundColor: displaySettings.theme }
      : {};

  return (
    <div className="h-full w-full flex flex-col gap-2.5">
      {/* Card preview area */}
      <div 
        className={`flex h-full flex-1 w-full flex-col gap-4 rounded-[30px] relative justify-center items-center p-8 ${getThemeBackground()}`}
        style={customBackgroundStyle}
      >
        {/* Card content - render all fields for current side */}
        <div className="flex flex-col items-center gap-4 pl-8">
          {fields.length > 0 ? (
            fields.map((field, index) => renderField(field, index))
          ) : (
            <p className="text-title-secondary/50 text-center">
              No fields configured for {side} side.<br />
              Add fields using the panel on the right.
            </p>
          )}
        </div>

        {/* Side indicator button (bottom left) */}
        <button 
          className="absolute bottom-2 left-2 leading-none px-5 py-3.75 bg-background rounded-full text-sm hover:bg-background/80 transition-colors duration-200 ease"
          onClick={onToggleSide}
        >
          {side === "front" ? "Front side" : "Back side"}
        </button>

        {/* Toggle button (bottom right) */}
        <button 
          className="absolute bottom-2 right-2 leading-none px-5 py-3.75 bg-background rounded-full text-sm hover:bg-background/80 transition-colors duration-200 ease"
          onClick={onToggleSide}
        >
          {side === "front" ? "Show back side" : "Show front side"}
        </button>
      </div>
    </div>
  );
}
