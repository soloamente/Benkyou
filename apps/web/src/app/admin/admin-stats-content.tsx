import { headers } from "next/headers";

export default async function AdminStatsContent() {
  const headersList = await headers();
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const cookieHeader = headersList.get("cookie");

  const apiHeaders = new Headers();
  if (cookieHeader) {
    apiHeaders.set("cookie", cookieHeader);
  }

  // Fetch activity stats for different periods
  const [daily, weekly, monthly] = await Promise.all([
    fetch(`${baseURL}/api/admin/stats/activity?period=daily`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${baseURL}/api/admin/stats/activity?period=weekly`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${baseURL}/api/admin/stats/activity?period=monthly`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : null)),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Last 24 Hours
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Users</span>
            <span className="font-semibold text-title">
              {daily?.newUsers || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Decks</span>
            <span className="font-semibold text-title">
              {daily?.newDecks || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Cards</span>
            <span className="font-semibold text-title">
              {daily?.newCards || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Study Sessions</span>
            <span className="font-semibold text-title">
              {daily?.studySessions || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Last 7 Days
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Users</span>
            <span className="font-semibold text-title">
              {weekly?.newUsers || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Decks</span>
            <span className="font-semibold text-title">
              {weekly?.newDecks || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Cards</span>
            <span className="font-semibold text-title">
              {weekly?.newCards || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Study Sessions</span>
            <span className="font-semibold text-title">
              {weekly?.studySessions || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Last 30 Days
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Users</span>
            <span className="font-semibold text-title">
              {monthly?.newUsers || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Decks</span>
            <span className="font-semibold text-title">
              {monthly?.newDecks || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">New Cards</span>
            <span className="font-semibold text-title">
              {monthly?.newCards || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Study Sessions</span>
            <span className="font-semibold text-title">
              {monthly?.studySessions || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
