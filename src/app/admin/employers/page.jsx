"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminListPendingEmployers, adminVerifyEmployer } from "@/lib/endpoints";
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Globe, Phone, Mail, Eye } from "lucide-react";

export default function AdminEmployersPage() {
  const { token } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminListPendingEmployers(token);
      const list = Array.isArray(res?.data) ? res.data : [];
      setEmployers(list);
      if (selectedEmployer) {
        const stillPending = list.find((e) => e.id === selectedEmployer.id);
        setSelectedEmployer(stillPending || null);
      }
    } catch (err) {
      setError(err?.message || "Failed to load pending employers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const handleVerify = async (employerProfileId, status) => {
    setProcessingId(employerProfileId);
    setError("");
    setActionMessage("");
    try {
      const res = await adminVerifyEmployer(employerProfileId, status, token);
      setEmployers((prev) => prev.filter((emp) => emp.id !== employerProfileId));
      if (selectedEmployer?.id === employerProfileId) {
        setSelectedEmployer(null);
      }
      setActionMessage(
        res?.message || `Employer marked as ${status}.`
      );
    } catch (err) {
      setError(err?.message || "Verification update failed.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              Employer Verification
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Review pending employer profiles and approve (`VERIFIED`) or reject (`REJECTED`) organizations.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPending}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:opacity-80 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
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
          Loading employers awaiting verification...
        </div>
      ) : employers.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/30 p-12 text-center">
          <ShieldCheck size={32} className="mx-auto text-[var(--color-accent)] opacity-75 mb-2" />
          <p className="text-base font-semibold text-[var(--color-ink)]">No pending verifications</p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            All employer accounts have been reviewed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left List: Pending Employers */}
          <div className="lg:col-span-7 space-y-3">
            {employers.map((emp) => {
              const isSelected = selectedEmployer?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployer(emp)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-surface-2)] shadow-sm"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)]/40 hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[var(--color-ink)]">
                          {emp.organizationName}
                        </h3>
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                          {emp.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)] mt-1">
                        Contact: {emp.user?.name} ({emp.user?.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployer(emp);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink)]"
                    >
                      <Eye size={13} />
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Review Employer Details & Authorize Action */}
          <div className="lg:col-span-5">
            {selectedEmployer ? (
              <div className="sticky top-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 p-5 space-y-5">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[var(--color-muted)]">
                    Review Employer Profile #{selectedEmployer.id}
                  </span>
                  <h2 className="text-xl font-bold text-[var(--color-ink)] mt-1">
                    {selectedEmployer.organizationName}
                  </h2>
                </div>

                <div className="space-y-2.5 text-xs text-[var(--color-ink)]">
                  <div className="flex items-center gap-2 text-[var(--color-muted)]">
                    <Mail size={14} />
                    <span>{selectedEmployer.user?.name} • {selectedEmployer.user?.email}</span>
                  </div>
                  {selectedEmployer.phone && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <Phone size={14} />
                      <span>{selectedEmployer.phone}</span>
                    </div>
                  )}
                  {selectedEmployer.website && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <Globe size={14} />
                      <a
                        href={selectedEmployer.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-accent)] underline break-all"
                      >
                        {selectedEmployer.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                  <span className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
                    Organization Description
                  </span>
                  <p className="text-sm text-[var(--color-ink)] mt-1 whitespace-pre-line">
                    {selectedEmployer.description || "No organization description provided."}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={processingId === selectedEmployer.id}
                    onClick={() => handleVerify(selectedEmployer.id, "VERIFIED")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    Approve (VERIFIED)
                  </button>
                  <button
                    disabled={processingId === selectedEmployer.id}
                    onClick={() => handleVerify(selectedEmployer.id, "REJECTED")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-xs text-[var(--color-muted)]">
                Select an employer from the list to inspect their details and approve or reject verification.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}