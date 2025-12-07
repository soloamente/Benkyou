"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeckStats, type DeckStats as DeckStatsType } from "@/lib/study-api";
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
// Helper function to format dates
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface DeckStatsProps {
  deckId: string;
}

export function DeckStats({ deckId }: DeckStatsProps) {
  const [stats, setStats] = useState<DeckStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [deckId]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const deckStats = await getDeckStats(deckId);
      setStats(deckStats);
    } catch (error) {
      console.error("Error loading deck stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deck Statistics</CardTitle>
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

  return (
    <div className="space-y-4">
      {/* Deck Name */}
      <Card>
        <CardHeader>
          <CardTitle>{stats.deckName}</CardTitle>
        </CardHeader>
      </Card>

      {/* Available Cards (can be studied now) */}
      <Card>
        <CardHeader>
          <CardTitle>Available Cards</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cards ready to study right now
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-xl font-bold mb-1 text-blue-600">
                {stats.cardCounts.due}
              </div>
              <div className="text-xs text-muted-foreground">Due</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-xl font-bold mb-1 text-purple-600">
                {stats.cardCounts.new}
              </div>
              <div className="text-xs text-muted-foreground">New</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10">
              <div className="text-xl font-bold mb-1 text-orange-600">
                {stats.cardCounts.learning}
              </div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-xl font-bold mb-1">
                {stats.cardCounts.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cards by State */}
      <Card>
        <CardHeader>
          <CardTitle>All Cards in Deck</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total cards by state (regardless of availability)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-xl font-bold mb-1 text-purple-600">
                {stats.stateCounts.new}
              </div>
              <div className="text-xs text-muted-foreground">New</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-500/10">
              <div className="text-xl font-bold mb-1 text-orange-600">
                {stats.stateCounts.learning}
              </div>
              <div className="text-xs text-muted-foreground">Learning</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-xl font-bold mb-1 text-green-600">
                {stats.stateCounts.review}
              </div>
              <div className="text-xs text-muted-foreground">Review</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-xl font-bold mb-1">
                {stats.stateCounts.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-xl font-bold mb-1">
                {stats.today.cardsStudied}
              </div>
              <div className="text-xs text-muted-foreground">Studied</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-xl font-bold mb-1 text-green-600">
                {stats.today.cardsCorrect}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10">
              <div className="text-xl font-bold mb-1 text-red-600">
                {stats.today.cardsIncorrect}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/50">
              <div className="text-xl font-bold mb-1">
                {stats.today.retentionRate}%
              </div>
              <div className="text-xs text-muted-foreground">Retention</div>
            </div>
          </div>
          {stats.today.studyTime > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Study Time
                  </span>
                </div>
                <span className="font-semibold">{stats.today.studyTime}m</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Statistics */}
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
                  <div className="font-medium">Total Sessions</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.overall.cardsStudied} cards studied
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.overall.sessions}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-green-600" />
                <div>
                  <div className="font-medium">Cards Correct</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.overall.cardsIncorrect} incorrect
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.overall.cardsCorrect}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Retention Rate</div>
                  <div className="text-sm text-muted-foreground">
                    Overall accuracy
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {stats.overall.retentionRate}%
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Total Study Time</div>
                  <div className="text-sm text-muted-foreground">
                    Across all sessions
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold">
                {stats.overall.studyTime}m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {formatDate(
                          typeof session.startedAt === "string"
                            ? new Date(session.startedAt)
                            : session.startedAt
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.cardsStudied} cards • {session.duration}m
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-green-600">
                      {session.cardsCorrect}✓
                    </div>
                    <div className="text-sm text-red-600">
                      {session.cardsIncorrect}✗
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



