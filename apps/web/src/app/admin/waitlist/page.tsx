"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const loadWaitlist = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/admin/waitlist?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load waitlist");
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error loading waitlist:", error);
      toast.error("Failed to load waitlist entries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, [statusFilter, offset]);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/waitlist/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to approve entry");
      }

      toast.success("Waitlist entry approved");
      loadWaitlist();
    } catch (error) {
      console.error("Error approving entry:", error);
      toast.error("Failed to approve entry");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/waitlist/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reject entry");
      }

      toast.success("Waitlist entry rejected");
      loadWaitlist();
    } catch (error) {
      console.error("Error rejecting entry:", error);
      toast.error("Failed to reject entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/waitlist/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      toast.success("Waitlist entry deleted");
      loadWaitlist();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-title">Waitlist Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage waitlist entries and approve or reject requests
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => {
              setStatusFilter(status);
              setOffset(0);
            }}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Waitlist Entries ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No waitlist entries found
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                        Created
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="p-3 text-sm text-title">{entry.email}</td>
                        <td className="p-3 text-sm text-title">
                          {entry.name || "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              entry.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : entry.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            {entry.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(entry.id)}
                                  className="h-8"
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(entry.id)}
                                  className="h-8"
                                >
                                  <X className="size-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(entry.id)}
                              className="h-8"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {offset + 1} to {Math.min(offset + limit, total)} of{" "}
                  {total} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
