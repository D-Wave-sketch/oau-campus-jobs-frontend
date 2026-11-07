"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminListUsers, adminUpdateUserRole } from "@/lib/endpoints";
import { Users, Search, Shield, GraduationCap, Building2, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminListUsers(token);
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleRoleChange = async (targetId, newRole) => {
    setUpdatingId(targetId);
    setError("");
    setActionMessage("");
    try {
      const res = await adminUpdateUserRole(targetId, newRole, token);
      const updated = res?.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, ...(updated || {}), role: newRole } : u))
      );
      setActionMessage(res?.message || "User role updated successfully.");
    } catch (err) {
      setError(err?.message || "Could not update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              Manage accounts and switch roles between Student and Employer.
            </p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:opacity-80 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/40 pl-10 pr-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-muted)]">
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-12 text-center text-sm text-[var(--color-muted)]">
          No matching users found.
        </div>
      ) : (
        <>
          {/* Mobile Card View (< sm screens) */}
          <div className="block sm:hidden space-y-3">
            {filtered.map((u) => {
              const isSelf = currentUser?.id === u.id;
              const isAdmin = u.role === "ADMIN";
              return (
                <div
                  key={u.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--color-ink)]">{u.name}</h3>
                      <p className="text-xs text-[var(--color-muted)] break-all">{u.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink)] shrink-0">
                      {u.role}
                    </span>
                  </div>

                  {u.studentProfile && (
                    <p className="text-[11px] text-[var(--color-muted)]">
                      {u.studentProfile.department || "No department"} • {u.studentProfile.level || "No level"}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-muted)]">Change Role:</span>
                    {isAdmin || isSelf ? (
                      <span className="text-xs text-[var(--color-muted)] italic">
                        {isSelf ? "Current Admin" : "Protected"}
                      </span>
                    ) : (
                      <select
                        disabled={updatingId === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="EMPLOYER">EMPLOYER</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (sm+ screens) */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/60 text-xs uppercase text-[var(--color-muted)]">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Name & Profile</th>
                    <th className="px-4 py-3.5 font-semibold">Email</th>
                    <th className="px-4 py-3.5 font-semibold">Role</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filtered.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isAdmin = u.role === "ADMIN";
                    return (
                      <tr key={u.id} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-[var(--color-ink)]">{u.name}</div>
                          {u.studentProfile && (
                            <div className="text-xs text-[var(--color-muted)]">
                              {u.studentProfile.department || "No department"} • {u.studentProfile.level || "No level"}
                            </div>
                          )}
                          {u.employerProfile && (
                            <div className="text-xs text-[var(--color-muted)]">
                              {u.employerProfile.organizationName} ({u.employerProfile.verificationStatus})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[var(--color-muted)]">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-ink)]">
                            {u.role === "ADMIN" && <Shield size={12} className="text-[var(--color-accent)]" />}
                            {u.role === "STUDENT" && <GraduationCap size={12} className="text-[var(--color-accent)]" />}
                            {u.role === "EMPLOYER" && <Building2 size={12} className="text-[var(--color-accent)]" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isAdmin || isSelf ? (
                            <span className="text-xs text-[var(--color-muted)] italic">
                              {isSelf ? "Current Admin" : "Protected"}
                            </span>
                          ) : (
                            <select
                              disabled={updatingId === u.id}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="EMPLOYER">EMPLOYER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}