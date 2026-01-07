import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import AdminStatsContent from "./admin-stats-content";

async function AdminOverviewContent() {
  const headersList = await headers();
  const authHeaders = new Headers();
  headersList.forEach((value, key) => {
    authHeaders.set(key, value);
  });

  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const cookieHeader = headersList.get("cookie");

  const apiHeaders = new Headers();
  if (cookieHeader) {
    apiHeaders.set("cookie", cookieHeader);
  }

  // Fetch overview stats
  const statsResponse = await fetch(`${baseURL}/api/admin/stats/overview`, {
    headers: apiHeaders,
    credentials: "include",
    cache: "no-store",
  });

  if (!statsResponse.ok) {
    return (
      <div className="text-destructive">
        Failed to load statistics. Please try again.
      </div>
    );
  }

  const stats = await statsResponse.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-title">Admin Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, waitlist, and view app statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Banned Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.bannedUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Waitlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.pendingWaitlist}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Decks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.totalDecks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.totalCards}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-title">
              {stats.totalStudySessions}
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<Spinner />}>
        <AdminStatsContent />
      </Suspense>
    </div>
  );
}

function AdminOverviewLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="size-8" />
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<AdminOverviewLoading />}>
      <AdminOverviewContent />
    </Suspense>
  );
}
