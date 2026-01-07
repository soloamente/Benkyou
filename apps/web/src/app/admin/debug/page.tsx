import { headers } from "next/headers";
import { auth } from "@benkyou/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDebugPage() {
  const headersList = await headers();
  const authHeaders = new Headers();
  headersList.forEach((value, key) => {
    authHeaders.set(key, value);
  });

  const session = await auth.api.getSession({
    headers: authHeaders,
  });

  const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const cookieHeader = headersList.get("cookie");

  // Test the admin check endpoint (Next.js API route)
  let adminTestResult: any = { error: "Not tested" };
  try {
    const apiHeaders = new Headers();
    if (cookieHeader) {
      apiHeaders.set("cookie", cookieHeader);
    }

    const response = await fetch(`${baseURL}/api/admin/check`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    });

    adminTestResult = {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      data: await response.json().catch(() => "Could not parse"),
    };
  } catch (error) {
    adminTestResult = {
      error: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
    };
  }

  // Also test the Elysia server endpoint for comparison
  const serverURL = process.env.SERVER_URL || "http://localhost:3000";
  let elysiaTestResult: any = { error: "Not tested" };
  try {
    const apiHeaders = new Headers();
    if (cookieHeader) {
      apiHeaders.set("cookie", cookieHeader);
    }

    const response = await fetch(`${serverURL}/api/admin/stats/overview`, {
      headers: apiHeaders,
      credentials: "include",
      cache: "no-store",
    });

    elysiaTestResult = {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      text: response.ok ? await response.json().catch(() => "Could not parse") : await response.text().catch(() => "Could not read"),
    };
  } catch (error) {
    elysiaTestResult = {
      error: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
    };
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Debug Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-background p-4 rounded-lg overflow-auto">
            {JSON.stringify(
              {
                hasSession: !!session,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
                userName: session?.user?.name,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-background p-4 rounded-lg overflow-auto">
            {JSON.stringify(
              {
                SERVER_URL: process.env.SERVER_URL || "NOT SET (default: http://localhost:3000)",
                NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Check (Next.js API Route)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <p>
              <strong>Base URL:</strong> {baseURL}
            </p>
            <p>
              <strong>Cookie Header:</strong> {cookieHeader ? "Present" : "Missing"}
            </p>
          </div>
          <pre className="bg-background p-4 rounded-lg overflow-auto">
            {JSON.stringify(adminTestResult, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elysia Server Test (for comparison)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <p>
              <strong>Server URL:</strong> {serverURL}
            </p>
            <p>
              <strong>Cookie Header:</strong> {cookieHeader ? "Present" : "Missing"}
            </p>
          </div>
          <pre className="bg-background p-4 rounded-lg overflow-auto">
            {JSON.stringify(elysiaTestResult, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
