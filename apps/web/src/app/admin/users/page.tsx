"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Ban, Unlock, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Only include search parameters when there's a search value
      const query: {
        limit: number;
        offset: number;
        sortBy: string;
        sortDirection: "asc" | "desc";
        searchValue?: string;
        searchField?: "email" | "name";
        searchOperator?: "contains" | "starts_with" | "ends_with";
      } = {
        limit,
        offset,
        sortBy: "createdAt",
        sortDirection: "desc",
      };

      // Only add search parameters if there's a search value
      if (searchValue.trim()) {
        query.searchValue = searchValue.trim();
        query.searchField = "email";
        query.searchOperator = "contains";
      }

      const result = await authClient.admin.listUsers({ query });
      
      // Better Auth returns data wrapped in a "data" property
      // Response structure: { data: { users: User[], total: number } }
      const responseData = result?.data || result;
      const users = responseData?.users || [];
      const total = responseData?.total ?? 0;

      setUsers(users);
      setTotal(total);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [offset]);

  const handleSearch = () => {
    setOffset(0);
    loadUsers();
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Are you sure you want to ban this user?")) {
      return;
    }

    try {
      await authClient.admin.banUser({
        userId,
        banReason: "Banned by admin",
      });
      toast.success("User banned successfully");
      loadUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId });
      toast.success("User unbanned successfully");
      loadUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    }
  };

  const handleSetRole = async (userId: string, role: string) => {
    try {
      await authClient.admin.setRole({ userId, role });
      toast.success(`User role set to ${role}`);
      loadUsers();
    } catch (error) {
      console.error("Error setting role:", error);
      toast.error("Failed to set user role");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-title">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, ban/unban, and set roles
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found
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
                        Role
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
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-3 text-sm text-title">{user.email}</td>
                        <td className="p-3 text-sm text-title">{user.name}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-background text-title">
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="p-3">
                          {user.banned ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            {user.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetRole(user.id, "admin")}
                                className="h-8"
                              >
                                <Shield className="size-4 mr-1" />
                                Make Admin
                              </Button>
                            )}
                            {user.banned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnban(user.id)}
                                className="h-8"
                              >
                                <Unlock className="size-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBan(user.id)}
                                className="h-8"
                              >
                                <Ban className="size-4 mr-1" />
                                Ban
                              </Button>
                            )}
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
                  {total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                  >
                    Next
                    <ChevronRight className="size-4 ml-1" />
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
