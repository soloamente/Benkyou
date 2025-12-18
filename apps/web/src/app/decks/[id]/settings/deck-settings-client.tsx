"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  type DeckSettings,
  type DeckDisplaySettings,
  type NoteTypeField,
  getDeckSettings,
  updateDeckSettings,
  DEFAULT_DECK_DISPLAY_SETTINGS,
} from "@/lib/deck-settings-api";
import { updateNoteType } from "@/lib/note-types-api";
import {
  CardPreview,
  FieldList,
  DisplayControls,
} from "@/components/deck-settings";
import { Spinner } from "@/components/ui/spinner";
import IconArrowDown from "@components/icons/arrow-down";
import IconCheck3 from "@components/icons/check-3";

interface DeckSettingsClientProps {
  deckId: string;
  deckName: string;
}

export function DeckSettingsClient({
  deckId,
  deckName,
}: DeckSettingsClientProps) {
  // State
  const [settings, setSettings] = useState<DeckSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardSide, setCardSide] = useState<"front" | "back">("front");

  // Local state for unsaved changes
  const [localDisplaySettings, setLocalDisplaySettings] =
    useState<DeckDisplaySettings>(DEFAULT_DECK_DISPLAY_SETTINGS);
  const [localFields, setLocalFields] = useState<NoteTypeField[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Computed: fields for current side
  const frontFields = useMemo(
    () => localFields.filter((f) => f.side === "front"),
    [localFields]
  );
  const backFields = useMemo(
    () => localFields.filter((f) => f.side === "back"),
    [localFields]
  );
  const currentSideFields = cardSide === "front" ? frontFields : backFields;

  // Fetch deck settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDeckSettings(deckId);
        setSettings(data);
        setLocalDisplaySettings(data.displaySettings);
        // Ensure all fields have a side property (migrate old data)
        const fieldsWithSide = (data.noteType?.fields || []).map((f, i) => ({
          ...f,
          side: f.side || (i === 0 ? "front" : "back"),
        })) as NoteTypeField[];
        setLocalFields(fieldsWithSide);
      } catch (err) {
        console.error("Error fetching deck settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [deckId]);

  // Handle display settings change
  const handleDisplaySettingsChange = (
    newSettings: Partial<DeckDisplaySettings>
  ) => {
    setLocalDisplaySettings((prev) => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  // Handle fields change for the current side
  const handleFieldsChange = (newSideFields: NoteTypeField[]) => {
    // Replace fields for the current side, keeping the other side's fields
    const otherSideFields = localFields.filter((f) => f.side !== cardSide);
    setLocalFields([...otherSideFields, ...newSideFields]);
    setHasUnsavedChanges(true);
  };

  // Handle add field to current side
  const handleAddField = () => {
    const sideFieldCount = currentSideFields.length;
    const newField: NoteTypeField = {
      name: `${cardSide === "front" ? "Front" : "Back"} Field ${sideFieldCount + 1}`,
      type: "text",
      side: cardSide,
    };
    setLocalFields([...localFields, newField]);
    setHasUnsavedChanges(true);
  };

  // Handle field settings (for future: open a modal to configure field)
  const handleFieldSettings = (fieldIndex: number) => {
    // Get the actual field from currentSideFields
    const field = currentSideFields[fieldIndex];
    if (field) {
      // TODO: Open field settings modal
      console.log("Open settings for field:", field.name);
      toast.info("Field settings coming soon!");
    }
  };

  // Handle remove field from current side
  const handleRemoveField = (fieldIndex: number) => {
    if (currentSideFields.length <= 1) {
      toast.error(`You must have at least one field on the ${cardSide} side`);
      return;
    }
    const field = currentSideFields[fieldIndex];
    if (!field) return;

    const fieldName = field.name;
    // Remove the field from localFields by finding the matching field
    const newFields = localFields.filter(
      (f) => !(f.name === field.name && f.side === field.side)
    );
    setLocalFields(newFields);
    setHasUnsavedChanges(true);
    toast.success(`Removed "${fieldName}"`);
  };

  // Handle toggle card side
  const handleToggleSide = () => {
    setCardSide((prev) => (prev === "front" ? "back" : "front"));
  };

  // Handle save
  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);

      // Update deck display settings
      await updateDeckSettings(deckId, {
        displaySettings: localDisplaySettings,
      });

      // Update note type fields if changed
      if (settings.noteType && localFields.length > 0) {
        await updateNoteType(settings.noteType.id, {
          fields: localFields,
        });
      }

      setHasUnsavedChanges(false);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle import (placeholder)
  const handleImport = () => {
    toast.info("Import feature coming soon!");
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="flex flex-col h-screen bg-background gap-3.75 m-5">
        <div className="w-full">
          <div className="flex w-full gap-2 items-center justify-center font-medium text-lg text-center align-middle">
            <span className="text-title-secondary opacity-40">Decks</span>
            <span className="text-title-secondary opacity-50">&gt;</span>
            <span className="text-title-secondary">{deckName}</span>
            <span className="text-title-secondary opacity-50">&gt;</span>
            <span className="text-title-secondary font-semibold">Settings</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="flex flex-col h-screen bg-background gap-3.75 m-5">
        <div className="w-full">
          <div className="flex w-full gap-2 items-center justify-center font-medium text-lg text-center align-middle">
            <Link href="/decks" className="text-title-secondary opacity-40">
              Decks
            </Link>
            <span className="text-title-secondary opacity-50">&gt;</span>
            <span className="text-title-secondary">{deckName}</span>
            <span className="text-title-secondary opacity-50">&gt;</span>
            <span className="text-title-secondary font-semibold">Settings</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-background gap-3.75 m-5">
      {/* Breadcrumb Navigation - centered at top */}
      <div className="w-full">
        <div className="flex w-full gap-2 items-center justify-center font-medium text-lg text-center align-middle">
          <Link
            href="/decks"
            className="text-title-secondary opacity-40 hover:opacity-60 transition-opacity duration-200 ease"
          >
            Decks
          </Link>
          <span className="text-title-secondary opacity-50">&gt;</span>
          <Link
            href={`/decks/${deckId}`}
            className="text-title-secondary hover:opacity-80 transition-opacity duration-200 ease"
          >
            {deckName}
          </Link>
          <span className="text-title-secondary opacity-50">&gt;</span>
          <span className="text-title-secondary font-semibold">Settings</span>
        </div>
      </div>

      {/* Main content section */}
      <div className="flex gap-2.5 w-full h-full min-h-0">
        {/* Left: Card preview and display controls */}
        <div className="h-full w-full flex flex-col gap-2.5 flex-6">
          {/* Card Preview */}
          <CardPreview
            side={cardSide}
            fields={currentSideFields}
            displaySettings={localDisplaySettings}
            onToggleSide={handleToggleSide}
          />

          {/* Display Controls (bottom toolbar) */}
          <DisplayControls
            displaySettings={localDisplaySettings}
            onSettingsChange={handleDisplaySettingsChange}
          />
        </div>

        {/* Right: Field list and action buttons */}
        <div className="flex flex-col gap-2.5 w-full h-full flex-1 min-w-0">
          {/* Field List for current side */}
          <FieldList
            fields={currentSideFields}
            onFieldsChange={handleFieldsChange}
            onAddField={handleAddField}
            onFieldSettings={handleFieldSettings}
            onRemoveField={handleRemoveField}
          />

          {/* Action buttons */}
          <div className="flex gap-2.5 w-full shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-primary flex-1 cursor-pointer h-fit font-semibold text-primary-foreground w-full justify-between flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none hover:bg-primary/90 transition-colors duration-200 ease disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="text-left">
                {isSaving ? "Saving..." : "Save settings"}
              </p>
              <div className="flex gap-1.25">
                <div className="flex flex-col cursor-pointer rounded-full text-primary justify-center items-center bg-background w-[30px] h-[30px]">
                  <IconCheck3 size={18} strokeWidth={3} />
                </div>
              </div>
            </button>
            <button
              onClick={handleImport}
              className="bg-card flex-0 cursor-pointer h-fit font-medium w-fit justify-between flex items-center gap-5 rounded-4xl pl-5 pr-2.5 py-2.5 leading-none hover:bg-card/80 transition-colors duration-200 ease"
            >
              <p>Import</p>
              <div className="flex gap-1.25">
                <div className="flex flex-col cursor-pointer rounded-full text-primary justify-center items-center bg-background w-[30px] h-[30px]">
                  <IconArrowDown size={16} strokeWidth={3} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
