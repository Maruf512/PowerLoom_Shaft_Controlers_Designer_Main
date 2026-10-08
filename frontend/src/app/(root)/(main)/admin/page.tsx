"use client";

import DesignDetails from "@/components/layout/DesignDetails";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import useUser from "@/hooks/useUser";
import apiClient from "@/lib/apiClient";
import { AdminStatsType, AdminUserType } from "@/types/auth";
import { ColorResponseType, Design, DesignDataRecievedType } from "@/types/data";
import { cn } from "@/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

type Tab = "users" | "designs" | "colors";

const AdminPage = () => {
  const toast = useToast();
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("users");
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [users, setUsers] = useState<AdminUserType[]>([]);
  const [designs, setDesigns] = useState<DesignDataRecievedType[]>([]);
  const [colors, setColors] = useState<ColorResponseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // designs tab state
  const [designSearch, setDesignSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [designsLoading, setDesignsLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [s, u, d, c] = await Promise.all([
      apiClient<AdminStatsType>("auth/admin/stats"),
      apiClient<AdminUserType[]>("auth/admin/users"),
      apiClient<DesignDataRecievedType[]>("auth/admin/designs"),
      apiClient<ColorResponseType[]>("auth/admin/colors"),
    ]);
    if (
      s.status === 403 ||
      u.status === 403 ||
      d.status === 403 ||
      c.status === 403
    ) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    if (s.data) setStats(s.data);
    if (u.data) setUsers(u.data);
    if (d.data) setDesigns(d.data);
    if (c.data) setColors(c.data);
    if (s.error || u.error || d.error || c.error)
      toast("Failed to load some admin data", "error");
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshDesigns = async () => {
    // Re-fetch the full list and filter client-side (list is capped at 200).
    setDesignsLoading(true);
    const { data, error } = await apiClient<DesignDataRecievedType[]>(
      "auth/admin/designs"
    );
    if (data) {
      let out = data;
      if (ownerFilter !== "all")
        out = out.filter((x) => String(x.user?.id) === ownerFilter);
      if (designSearch.trim())
        out = out.filter((x) =>
          x.name.toLowerCase().includes(designSearch.trim().toLowerCase())
        );
      setDesigns(out);
    } else if (error) {
      toast("Failed to refresh designs", "error");
    }
    setDesignsLoading(false);
  };

  const toggleField = async (
    id: number,
    field: "is_admin" | "is_active",
    value: boolean
  ) => {
    const { data, error } = await apiClient<AdminUserType>(
      `auth/admin/users/${id}`,
      { method: "PATCH", body: { [field]: !value } }
    );
    if (error || !data) {
      toast("Update failed", "error");
      return;
    }
    setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)));
    toast("User updated", "success");
    const { data: s } = await apiClient<AdminStatsType>("auth/admin/stats");
    if (s) setStats(s);
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user and all their designs?")) return;
    const { error } = await apiClient(`auth/admin/users/${id}`, {
      method: "DELETE",
    });
    if (error) {
      toast(typeof error === "string" ? error : "Delete failed", "error");
      return;
    }
    setUsers((prev) => prev.filter((x) => x.id !== id));
    toast("User deleted", "success");
  };

  const deleteDesign = async (id: number) => {
    if (!confirm("Delete this design permanently?")) return;
    const { error } = await apiClient(`auth/admin/designs/${id}`, {
      method: "DELETE",
    });
    if (error) {
      toast(typeof error === "string" ? error : "Delete failed", "error");
      return;
    }
    setDesigns((prev) => prev.filter((x) => x.id !== id));
    if (expandedId === id) setExpandedId(null);
    toast("Design deleted", "success");
  };

  const ownerName = useMemo(() => {
    const m: Record<number, string> = {};
    users.forEach((u) => (m[u.id] = u.name));
    return m;
  }, [users]);

  if (loading)
    return <p className="text-sm text-muted">Loading admin dashboard…</p>;
  if (forbidden || (user && !user.is_admin))
    return (
      <div className="bg-surface border border-muted rounded-radius-lg p-8 text-center">
        <h1 className="font-semibold">Access denied</h1>
        <p className="text-sm text-muted mt-2">
          This page is for admins only. Ask an admin to promote your account
          (<code>is_admin=True</code>).
        </p>
      </div>
    );

  const totals = stats?.totals;
  const cards = [
    { label: "Users", value: totals?.users ?? users.length },
    {
      label: "Admins",
      value: totals?.admins ?? users.filter((x) => x.is_admin).length,
    },
    { label: "Designs", value: totals?.designs ?? designs.length },
    { label: "Colors", value: totals?.colors ?? colors.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Admin dashboard</h1>
        <p className="text-sm text-muted">
          Users, design files, colors and roles — full access.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-surface border border-muted rounded-radius-lg p-4"
          >
            <p className="text-xs text-muted uppercase">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(["users", "designs", "colors"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium border capitalize",
              tab === t
                ? "bg-primary text-white border-primary"
                : "border-muted hover:bg-muted/30"
            )}
          >
            {t} ({t === "users" ? users.length : t === "designs" ? designs.length : colors.length})
          </button>
        ))}
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={loadAll}>
            Refresh
          </Button>
        </div>
      </div>

      {tab === "users" && (
        <>
          {stats?.designs_per_user?.length ? (
            <div className="bg-surface border border-muted rounded-radius-lg p-4 overflow-x-auto">
              <h2 className="font-semibold text-sm mb-3">Top designers</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted text-xs">
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">Designs</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.designs_per_user.map((r) => (
                    <tr key={r.id} className="border-t border-muted">
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4">{r.email}</td>
                      <td className="py-2">{r.total_designs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="bg-surface border border-muted rounded-radius-lg p-4 overflow-x-auto">
            <h2 className="font-semibold text-sm mb-3">All users ({users.length})</h2>
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-muted text-xs">
                  <th className="py-2 pr-3">User</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Designs</th>
                  <th className="py-2 pr-3">Admin</th>
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-muted">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-muted shrink-0">
                          <Image
                            src={u.avatar_url || "/profile.png"}
                            alt={u.name}
                            layout="fill"
                            objectFit="cover"
                            unoptimized={(u.avatar_url || "").startsWith("http")}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name}</p>
                          <p className="text-xs text-muted truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-xs">{u.phone || "—"}</td>
                    <td className="py-2 pr-3">{u.total_designs ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => toggleField(u.id, "is_admin", !!u.is_admin)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          u.is_admin
                            ? "bg-primary text-white border-primary"
                            : "border-muted"
                        }`}
                      >
                        {u.is_admin ? "admin" : "user"}
                      </button>
                    </td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={() => toggleField(u.id, "is_active", !!u.is_active)}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          u.is_active !== false
                            ? "border-muted"
                            : "bg-red-100 border-red-300 text-red-700"
                        }`}
                      >
                        {u.is_active !== false ? "active" : "banned"}
                      </button>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-xs px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "designs" && (
        <div className="space-y-4">
          <div className="bg-surface border border-muted rounded-radius-lg p-4 flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="text-xs font-medium">Search designs</label>
              <input
                value={designSearch}
                onChange={(e) => setDesignSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refreshDesigns()}
                placeholder="Design name…"
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              />
            </div>
            <div className="md:w-64">
              <label className="text-xs font-medium">Owner</label>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-muted rounded-md bg-secondary text-sm"
              >
                <option value="all">All users</option>
                {users.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={refreshDesigns} isLoading={designsLoading}>
              Apply
            </Button>
          </div>

          <div className="bg-surface border border-muted rounded-radius-lg p-4 overflow-x-auto">
            <h2 className="font-semibold text-sm mb-3">
              All design files ({designs.length})
            </h2>
            {designs.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No designs found.</p>
            ) : (
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-left text-muted text-xs">
                    <th className="py-2 pr-3">Design</th>
                    <th className="py-2 pr-3">Owner</th>
                    <th className="py-2 pr-3">Machine</th>
                    <th className="py-2 pr-3">Updated</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designs.map((d) => (
                    <Fragment key={d.id}>
                      <tr className="border-t border-muted">
                        <td className="py-2 pr-3 font-medium">{d.name}</td>
                        <td className="py-2 pr-3 text-xs">
                          {d.user?.name || ownerName[d.user?.id] || `ID ${d.user?.id}`}
                          <span className="text-muted"> · {d.user?.email}</span>
                        </td>
                        <td className="py-2 pr-3 text-xs">{d.machine_type || "—"}</td>
                        <td className="py-2 pr-3 text-xs">
                          {d.updated_at?.split("T")[0] || "—"}
                        </td>
                        <td className="py-2 text-right whitespace-nowrap">
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === d.id ? null : d.id)
                            }
                            className="text-xs px-2 py-1 rounded-md border border-muted hover:bg-muted/30 mr-1"
                          >
                            {expandedId === d.id ? "Hide" : "View + Simulate"}
                          </button>
                          <Link
                            href={`/admin/designs/${d.id}/edit`}
                            className="text-xs px-2 py-1 rounded-md border border-muted hover:bg-muted/30 mr-1"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteDesign(d.id)}
                            className="text-xs px-2 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedId === d.id && (
                        <tr className="border-t border-muted">
                          <td colSpan={5} className="py-4">
                            <DesignDetails
                              designer={d as unknown as Design}
                              apiBase="auth/admin/designs"
                              deleteRedirect="/admin"
                              onDeleted={(id) => {
                                setDesigns((prev) => prev.filter((x) => x.id !== id));
                                setExpandedId(null);
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "colors" && (
        <div className="bg-surface border border-muted rounded-radius-lg p-4 overflow-x-auto">
          <h2 className="font-semibold text-sm mb-3">
            All color palettes ({colors.length})
          </h2>
          {colors.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No colors found.</p>
          ) : (
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-muted text-xs">
                  <th className="py-2 pr-3">Swatch</th>
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {colors.map((c) => (
                  <tr key={c.id} className="border-t border-muted">
                    <td className="py-2 pr-3">
                      <span
                        className="inline-block w-8 h-8 rounded-md border border-muted"
                        style={{ backgroundColor: c.color }}
                      />
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{c.color}</td>
                    <td className="py-2 pr-3 text-xs">
                      {c.user?.name} <span className="text-muted">· {c.user?.email}</span>
                    </td>
                    <td className="py-2 text-xs">{c.created_at?.split("T")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
