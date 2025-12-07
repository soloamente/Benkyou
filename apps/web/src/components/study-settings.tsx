"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getStudySettings,
  updateStudySettings,
  type StudySettings as StudySettingsType,
} from "@/lib/study-api";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Save } from "lucide-react";

export function StudySettings() {
  const [settings, setSettings] = useState<StudySettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [learningStepsStr, setLearningStepsStr] = useState("");
  const [relearningStepsStr, setRelearningStepsStr] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const loadedSettings = await getStudySettings();
      setSettings(loadedSettings);
      setLearningStepsStr(loadedSettings.learningSteps.join(", "));
      setRelearningStepsStr(loadedSettings.relearningSteps.join(", "));
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load study settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      // Parse learning steps
      const learningSteps = learningStepsStr
        .split(",")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      // Parse relearning steps
      const relearningSteps = relearningStepsStr
        .split(",")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      if (learningSteps.length === 0) {
        toast.error("Learning steps must have at least one value");
        setIsSaving(false);
        return;
      }

      if (relearningSteps.length === 0) {
        toast.error("Relearning steps must have at least one value");
        setIsSaving(false);
        return;
      }

      const updated = await updateStudySettings({
        ...settings,
        learningSteps,
        relearningSteps,
      });

      setSettings(updated);
      toast.success("Study settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save study settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof StudySettingsType, value: number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Settings</CardTitle>
        <CardDescription>
          Configure your spaced repetition study preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newCardsPerDay">New Cards Per Day</Label>
            <Input
              id="newCardsPerDay"
              type="number"
              min="1"
              max="1000"
              value={settings.newCardsPerDay}
              onChange={(e) =>
                handleFieldChange(
                  "newCardsPerDay",
                  parseInt(e.target.value) || 20
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of new cards to introduce per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxReviewsPerDay">Max Reviews Per Day</Label>
            <Input
              id="maxReviewsPerDay"
              type="number"
              min="1"
              max="10000"
              value={settings.maxReviewsPerDay}
              onChange={(e) =>
                handleFieldChange(
                  "maxReviewsPerDay",
                  parseInt(e.target.value) || 200
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of review cards per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningSteps">Learning Steps (minutes)</Label>
            <Input
              id="learningSteps"
              type="text"
              value={learningStepsStr}
              onChange={(e) => setLearningStepsStr(e.target.value)}
              placeholder="1, 10"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of minutes for learning steps (e.g., "1, 10")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relearningSteps">Relearning Steps (minutes)</Label>
            <Input
              id="relearningSteps"
              type="text"
              value={relearningStepsStr}
              onChange={(e) => setRelearningStepsStr(e.target.value)}
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of minutes for relearning steps (e.g., "10")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduatingInterval">
              Graduating Interval (days)
            </Label>
            <Input
              id="graduatingInterval"
              type="number"
              min="1"
              max="365"
              value={settings.graduatingInterval}
              onChange={(e) =>
                handleFieldChange(
                  "graduatingInterval",
                  parseInt(e.target.value) || 1
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Days until a card graduates from learning to review
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="easyInterval">Easy Interval (days)</Label>
            <Input
              id="easyInterval"
              type="number"
              min="1"
              max="365"
              value={settings.easyInterval}
              onChange={(e) =>
                handleFieldChange("easyInterval", parseInt(e.target.value) || 4)
              }
            />
            <p className="text-xs text-muted-foreground">
              Initial interval for cards marked as "Easy"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumInterval">Minimum Interval (days)</Label>
            <Input
              id="minimumInterval"
              type="number"
              min="1"
              max="365"
              value={settings.minimumInterval}
              onChange={(e) =>
                handleFieldChange(
                  "minimumInterval",
                  parseInt(e.target.value) || 1
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Minimum days between reviews
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximumInterval">Maximum Interval (days)</Label>
            <Input
              id="maximumInterval"
              type="number"
              min="1"
              max="36500"
              value={settings.maximumInterval}
              onChange={(e) =>
                handleFieldChange(
                  "maximumInterval",
                  parseInt(e.target.value) || 36500
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum days between reviews
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner className="size-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}



