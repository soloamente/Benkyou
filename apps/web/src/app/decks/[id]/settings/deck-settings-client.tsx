"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  getStudySettings,
  updateStudySettings,
  type StudySettings,
} from "@/lib/study-api";
import { Spinner } from "@/components/ui/spinner";

interface DeckSettingsClientProps {
  deckId: string;
  deckName: string; // Kept for future use (e.g. breadcrumb)
}

/** Anki-style setting row: label on left, control on right */
function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pl-6  py-2.5 pr-2.5 rounded-full bg-card">
      <span className="font-normal! text-foreground shrink-0">{label}</span>
      <div className="  ">{children}</div>
    </div>
  );
}

/** Styled input for Anki-like deck options */
function SettingsInput({
  value,
  onValueChange,
  type = "text",
  min,
  max,
  className = "",
  ...props
}: Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> & {
  value: string | number;
  onValueChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      min={min}
      max={max}
      className={`flex items-center justify-center leading-none bg-background px-3.75 py-2.5 rounded-full text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 ${className}`}
      {...props}
    />
  );
}

/** Styled select for Anki-like deck options */
function SettingsSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  "aria-label"?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="h-9 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Format minutes array to Anki-style string (e.g. [10] -> "10m", [1,10] -> "1m 10m") */
function formatSteps(steps: number[]): string {
  if (!steps.length) return "";
  return steps.map((s) => `${s}m`).join(" ");
}

/** Parse "10m" or "1m 10m" style string to number[] */
function parseSteps(str: string): number[] {
  return str
    .split(/\s+/)
    .map((s) => parseFloat(s.replace(/m$/, "")))
    .filter((n) => !isNaN(n) && n > 0);
}

/** Anki-style category card */
function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl flex bg-background p-4">
      <div className="flex flex-1 items-start justify-start gap-2">
      <h3 className="mb-3 text-2xl font-semibold text-foreground">{title}</h3></div>
      <div className="flex flex-col flex-1 gap-2.5">{children}</div>
    </div>
  );
}

export function DeckSettingsClient({
  deckId,
  deckName,
}: DeckSettingsClientProps) {
  const [studySettings, setStudySettings] = useState<StudySettings | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local form state (mirrors study settings; deck options inherit user defaults for now)
  const [newCardsPerDay, setNewCardsPerDay] = useState("10");
  const [maxReviewsPerDay, setMaxReviewsPerDay] = useState("9999");
  const [newCardsOverLimit, setNewCardsOverLimit] = useState<"yes" | "no">("no");
  const [limitsStartFromTop, setLimitsStartFromTop] = useState<"yes" | "no">(
    "no"
  );
  const [relearningSteps, setRelearningSteps] = useState("30m");
  const [leechThreshold, setLeechThreshold] = useState("4");
  const [leechAction, setLeechAction] = useState("tag");
  const [fsrsEnabled, setFsrsEnabled] = useState<"enabled" | "disabled">(
    "disabled"
  );
  const [learningSteps, setLearningSteps] = useState("10m");
  const [insertionOrder, setInsertionOrder] = useState("sequential");
  const [gatherOrderNew, setGatherOrderNew] = useState("ascending");
  const [sortOrder, setSortOrder] = useState("gathered");
  const [gatherOrderReview, setGatherOrderReview] = useState("sequential");
  const [buryNewSiblings, setBuryNewSiblings] = useState<"yes" | "no">("no");
  const [buryReviewSiblings, setBuryReviewSiblings] = useState<"yes" | "no">(
    "no"
  );
  const [buryInterdaySiblings, setBuryInterdaySiblings] = useState<
    "yes" | "no"
  >("no");

  // Fetch study settings (user-level) and deck settings on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        setIsLoading(true);
        setError(null);
        const study = await getStudySettings();
        setStudySettings(study);

        // Populate form from study settings
        setNewCardsPerDay(String(study.newCardsPerDay));
        setMaxReviewsPerDay(String(study.maxReviewsPerDay));
        setRelearningSteps(formatSteps(study.relearningSteps));
        setLearningSteps(formatSteps(study.learningSteps));
        setFsrsEnabled(study.fsrsParameters ? "enabled" : "disabled");
      } catch (err) {
        console.error("Error fetching deck settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchAll();
  }, [deckId]);

  const hasStudyChanges = () => {
    if (!studySettings) return false;
    const relearning = parseSteps(relearningSteps);
    const learning = parseSteps(learningSteps);
    return (
      Number(newCardsPerDay) !== studySettings.newCardsPerDay ||
      Number(maxReviewsPerDay) !== studySettings.maxReviewsPerDay ||
      JSON.stringify(relearning) !==
        JSON.stringify(studySettings.relearningSteps) ||
      JSON.stringify(learning) !== JSON.stringify(studySettings.learningSteps)
    );
  };

  const handleSave = async () => {
    if (!studySettings) return;

    try {
      setIsSaving(true);

      const relearning = parseSteps(relearningSteps);
      const learning = parseSteps(learningSteps);

      if (learning.length === 0) {
        toast.error("Learning steps must have at least one value (e.g. 10m)");
        setIsSaving(false);
        return;
      }
      if (relearning.length === 0) {
        toast.error("Relearning steps must have at least one value (e.g. 30m)");
        setIsSaving(false);
        return;
      }

      await updateStudySettings({
        newCardsPerDay: Math.max(1, Math.min(9999, Number(newCardsPerDay) || 20)),
        maxReviewsPerDay: Math.max(
          1,
          Math.min(99999, Number(maxReviewsPerDay) || 9999)
        ),
        learningSteps: learning,
        relearningSteps: relearning,
      });

      toast.success("Deck settings saved");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 overflow-auto pb-8">
      {/* Two containers: left and right */}
      <div className="flex w-full flex-row gap-4 flex-wrap md:flex-nowrap">
        {/* Left container */}
        <div className="flex flex-1 min-w-0 flex-col gap-4">
          <SettingsCard title="Daily Limits">
            <SettingRow label="New cards">
              <SettingsInput
                type="number"
                value={newCardsPerDay}
                onValueChange={(v) => setNewCardsPerDay(v)}
                min={1}
                max={9999}
              />
            </SettingRow>
            <SettingRow label="Max reviews">
              <SettingsInput
                type="number"
                value={maxReviewsPerDay}
                onValueChange={(v) => setMaxReviewsPerDay(v)}
                min={1}
                max={99999}
              />
            </SettingRow>
            <SettingRow label="New cards over limit">
              <SettingsSelect
                value={newCardsOverLimit}
                onChange={(v) => setNewCardsOverLimit(v as "yes" | "no")}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                aria-label="New cards over limit"
              />
            </SettingRow>
            <SettingRow label="Limits start from top">
              <SettingsSelect
                value={limitsStartFromTop}
                onChange={(v) => setLimitsStartFromTop(v as "yes" | "no")}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                aria-label="Limits start from top"
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="Lapses">
            <SettingRow label="Relearning steps">
              <SettingsInput
                value={relearningSteps}
                onValueChange={(v) => setRelearningSteps(v)}
                placeholder="30m"
              />
            </SettingRow>
            <SettingRow label="Leech threshold">
              <SettingsInput
                type="number"
                value={leechThreshold}
                onValueChange={(v) => setLeechThreshold(v)}
                min={1}
                max={20}
              />
            </SettingRow>
            <SettingRow label="Leech action">
              <SettingsSelect
                value={leechAction}
                onChange={setLeechAction}
                options={[
                  { value: "tag", label: "Tag only" },
                  { value: "suspend", label: "Suspend" },
                ]}
                aria-label="Leech action"
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="FSRS">
            <SettingRow label="FSRS">
              <SettingsSelect
                value={fsrsEnabled}
                onChange={(v) =>
                  setFsrsEnabled(v as "enabled" | "disabled")
                }
                options={[
                  { value: "disabled", label: "Disabled" },
                  { value: "enabled", label: "Enabled" },
                ]}
                aria-label="FSRS scheduler"
              />
            </SettingRow>
          </SettingsCard>
        </div>

        {/* Right container */}
        <div className="flex flex-1 min-w-0 flex-col gap-4">
          <SettingsCard title="New Cards">
            <SettingRow label="Learning steps">
              <SettingsInput
                value={learningSteps}
                onValueChange={(v) => setLearningSteps(v)}
                placeholder="10m"
              />
            </SettingRow>
            <SettingRow label="Insertion order">
              <SettingsSelect
                value={insertionOrder}
                onChange={setInsertionOrder}
                options={[
                  { value: "sequential", label: "Sequential" },
                  { value: "random", label: "Random" },
                ]}
                aria-label="Insertion order"
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="Display Order">
            <SettingRow label="Gather order">
              <SettingsSelect
                value={gatherOrderNew}
                onChange={setGatherOrderNew}
                options={[
                  { value: "ascending", label: "Ascending" },
                  { value: "descending", label: "Descending" },
                  { value: "random", label: "Random" },
                ]}
                aria-label="Gather order"
              />
            </SettingRow>
            <SettingRow label="Sort order">
              <SettingsSelect
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "gathered", label: "Order gathered" },
                  { value: "random", label: "Random" },
                ]}
                aria-label="Sort order"
              />
            </SettingRow>
            <SettingRow label="Gather order (reviews)">
              <SettingsSelect
                value={gatherOrderReview}
                onChange={setGatherOrderReview}
                options={[
                  { value: "sequential", label: "Sequential" },
                  { value: "random", label: "Random" },
                ]}
                aria-label="Gather order for reviews"
              />
            </SettingRow>
          </SettingsCard>

          <SettingsCard title="Burying">
            <SettingRow label="New siblings">
              <SettingsSelect
                value={buryNewSiblings}
                onChange={(v) => setBuryNewSiblings(v as "yes" | "no")}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                aria-label="Bury new siblings"
              />
            </SettingRow>
            <SettingRow label="Review siblings">
              <SettingsSelect
                value={buryReviewSiblings}
                onChange={(v) => setBuryReviewSiblings(v as "yes" | "no")}
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                aria-label="Bury review siblings"
              />
            </SettingRow>
            <SettingRow label="Interday learning siblings">
              <SettingsSelect
                value={buryInterdaySiblings}
                onChange={(v) =>
                  setBuryInterdaySiblings(v as "yes" | "no")
                }
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
                aria-label="Bury interday learning siblings"
              />
            </SettingRow>
          </SettingsCard>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasStudyChanges()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
