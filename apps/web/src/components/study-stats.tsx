"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getStudyStats,
  getDailyStats,
  type StudyStats as StudyStatsType,
  type DailyStats,
} from "@/lib/study-api";
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function StudyStats() {
  const [stats, setStats] = useState<StudyStatsType | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [studyStats, todayStats] = await Promise.all([
        getStudyStats(),
        getDailyStats(),
      ]);
      setStats(studyStats);
      setDailyStats(todayStats);
    } catch (error) {
      console.error("Error loading study stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const retentionRate =
    dailyStats && dailyStats.cardsStudied > 0
      ? Math.round((dailyStats.cardsCorrect / dailyStats.cardsStudied) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <div className="text-xl font-bold mb-1">
                  {dailyStats.cardsStudied}
                </div>
                <div className="text-xs text-muted-foreground">Studied</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <div className="text-xl font-bold mb-1 text-green-600">
                  {dailyStats.cardsCorrect}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <div className="text-xl font-bold mb-1 text-red-600">
                  {dailyStats.cardsIncorrect}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50">
                <div className="text-xl font-bold mb-1">{retentionRate}%</div>
                <div className="text-xs text-muted-foreground">Retention</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No study data for today
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Cards Due</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.newCards} new, {stats.reviewCards} review
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.cardsDue}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Study Time Today</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.cardsStudiedToday} cards studied
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.studyTimeToday}m</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Current Streak</div>
                  <div className="text-sm text-muted-foreground">
                    Days in a row
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.streak}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-xl font-bold mb-1 text-blue-600">
                {stats.cardsDue}
              </div>
              <div className="text-xs text-muted-foreground">Review</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-xl font-bold mb-1 text-purple-600">
                {stats.newCards}
              </div>
              <div className="text-xs text-muted-foreground">New</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10">
              <div className="text-xl font-bold mb-1 text-orange-600">
                {stats.learnCount}
              </div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-xl font-bold mb-1">
                {stats.cardsDue + stats.newCards + stats.learnCount}
              </div>
              <div className="text-xs text-muted-foreground">Total Due</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



