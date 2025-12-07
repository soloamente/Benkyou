"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getHeatmapData,
  type HeatmapData as HeatmapDataType,
  type HeatmapDay,
} from "@/lib/study-api";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyHeatmapProps {
  deckId?: string;
}

export function StudyHeatmap({ deckId }: StudyHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    loadHeatmapData();
  }, [currentYear, deckId]);

  const loadHeatmapData = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(currentYear, 0, 1); // January 1st
      const endDate = new Date(currentYear, 11, 31); // December 31st

      const data = await getHeatmapData(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        deckId
      );
      setHeatmapData(data);
    } catch (error) {
      console.error("Error loading heatmap data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate all days of the year, organized by weeks
  const yearDays = useMemo(() => {
    const days: Array<{
      date: Date;
      dateKey: string;
      dayOfWeek: number;
      weekOfYear: number;
    }> = [];

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Find the first Sunday before or on Jan 1st
    const firstDay = startDate.getDay();
    const daysToSubtract = firstDay; // Go back to Sunday

    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - daysToSubtract);

    let weekOfYear = 0;
    const maxIterations = 400; // Safety limit (365 + buffer)
    let iterations = 0;

    while (iterations < maxIterations) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const dayOfWeek = currentDate.getDay();

      // Start a new week on Sunday
      if (dayOfWeek === 0) {
        weekOfYear++;
      }

      // Only include days within the year range
      if (currentDate >= startDate && currentDate <= endDate) {
        days.push({
          date: new Date(currentDate),
          dateKey,
          dayOfWeek,
          weekOfYear,
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      iterations++;

      // Stop after we've passed the end date and completed the week
      if (currentDate > endDate && dayOfWeek === 6) {
        break;
      }
    }

    return days;
  }, [currentYear]);

  // Create a map of dateKey -> HeatmapDay for quick lookup
  const dataMap = useMemo(() => {
    if (!heatmapData) return new Map<string, HeatmapDay>();
    const map = new Map<string, HeatmapDay>();
    heatmapData.data.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [heatmapData]);

  // Calculate max activity for color scaling
  const maxActivity = useMemo(() => {
    if (!heatmapData) return 1;
    return Math.max(
      ...heatmapData.data.map((d) => Math.max(d.cardsStudied, d.cardsDue)),
      1
    );
  }, [heatmapData]);

  // Get color intensity based on activity level
  const getColorIntensity = (cardsStudied: number, cardsDue: number) => {
    const activity = cardsStudied > 0 ? cardsStudied : cardsDue;

    if (activity === 0) {
      return "bg-gray-200 dark:bg-gray-800"; // No activity
    }

    const intensity = Math.min(activity / maxActivity, 1);
    if (intensity < 0.2) {
      return "bg-green-200 dark:bg-green-900";
    } else if (intensity < 0.4) {
      return "bg-green-300 dark:bg-green-700";
    } else if (intensity < 0.6) {
      return "bg-green-400 dark:bg-green-600";
    } else if (intensity < 0.8) {
      return "bg-green-500 dark:bg-green-500";
    } else {
      return "bg-green-600 dark:bg-green-400";
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get day name abbreviation
  const getDayName = (dayIndex: number): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  // Group days by week
  const weeks = useMemo(() => {
    const weekMap = new Map<
      number,
      Array<{
        date: Date;
        dateKey: string;
        dayOfWeek: number;
        weekOfYear: number;
      }>
    >();

    yearDays.forEach((day) => {
      if (!weekMap.has(day.weekOfYear)) {
        weekMap.set(day.weekOfYear, []);
      }
      weekMap.get(day.weekOfYear)!.push(day);
    });

    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, days]) => days);
  }, [yearDays]);

  const handleDayHover = (
    day: HeatmapDay | null,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    setHoveredDay(day);
    if (day && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else {
      setHoverPosition(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Study Activity</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(new Date().getFullYear())}
            >
              <Circle className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentYear(currentYear + 1)}
              disabled={currentYear >= new Date().getFullYear()}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-2">
                <div className="h-4"></div>
                {["Mon", "Wed", "Fri"].map((day) => (
                  <div key={day} className="h-3 text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Weeks */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day) => {
                      const dayData = dataMap.get(day.dateKey);
                      const cardsStudied = dayData?.cardsStudied || 0;
                      const cardsDue = dayData?.cardsDue || 0;
                      const hasActivity = cardsStudied > 0 || cardsDue > 0;

                      // Create a day data object even if not in the data
                      const displayDay: HeatmapDay = dayData || {
                        date: day.dateKey,
                        cardsStudied: 0,
                        cardsDue: 0,
                        sessions: 0,
                      };

                      return (
                        <div
                          key={day.dateKey}
                          className={`size-3 rounded-sm border border-transparent cursor-pointer transition-all ${getColorIntensity(
                            cardsStudied,
                            cardsDue
                          )} ${hasActivity ? "hover:border-white hover:scale-110" : ""}`}
                          onMouseEnter={(e) => {
                            handleDayHover(displayDay, e);
                          }}
                          onMouseLeave={() => {
                            setHoveredDay(null);
                            setHoverPosition(null);
                          }}
                          title={
                            hasActivity
                              ? `${cardsStudied} cards reviewed${cardsDue > 0 ? `, ${cardsDue} cards due` : ""} on ${formatDate(day.date)}`
                              : `No activity on ${formatDate(day.date)}`
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredDay && hoverPosition && (
            <div
              className="fixed z-50 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border pointer-events-none whitespace-nowrap"
              style={{
                left: `${hoverPosition.x}px`,
                top: `${hoverPosition.y}px`,
                transform: "translateX(-50%) translateY(-100%)",
              }}
            >
              <div className="font-semibold">
                {hoveredDay.cardsStudied > 0 && (
                  <span>{hoveredDay.cardsStudied} cards reviewed</span>
                )}
                {hoveredDay.cardsStudied > 0 && hoveredDay.cardsDue > 0 && (
                  <span>, </span>
                )}
                {hoveredDay.cardsDue > 0 && (
                  <span>{hoveredDay.cardsDue} cards due</span>
                )}
                {hoveredDay.cardsStudied === 0 && hoveredDay.cardsDue === 0 && (
                  <span>No activity</span>
                )}{" "}
                on {formatDate(new Date(hoveredDay.date))}
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="flex flex-wrap items-center gap-6 text-sm pt-4 border-t">
            <div>
              Daily average:{" "}
              <span className="font-bold text-green-600">
                {heatmapData.summary.dailyAverage} cards
              </span>
            </div>
            <div>
              Days learned:{" "}
              <span className="font-bold text-green-600">
                {heatmapData.summary.daysLearned}%
              </span>
            </div>
            <div>
              Longest streak:{" "}
              <span className="font-bold text-yellow-500">
                {heatmapData.summary.longestStreak} days
              </span>
            </div>
            <div>
              Current streak:{" "}
              <span className="font-bold">
                {heatmapData.summary.currentStreak} day
                {heatmapData.summary.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="size-3 rounded-sm bg-gray-200 dark:bg-gray-800"></div>
              <div className="size-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
              <div className="size-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
              <div className="size-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
              <div className="size-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
              <div className="size-3 rounded-sm bg-green-600 dark:bg-green-400"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



