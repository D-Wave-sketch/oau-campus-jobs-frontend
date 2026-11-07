"use client";
// ============================================================================
// SECTION: STUDENT - SAVED JOBS
// ============================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSavedJobs, unsaveJob } from "@/lib/endpoints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import {
  Bookmark,
  BookmarkX,
  MapPin,
  Banknote,
  ArrowUpRight,
  Search,
  X,
  Loader2,
} from "lucide-react";

const UNDO_MS = 5000;

const jobOf = (s) => s.job || s;
const jobIdOf = (s) => jobOf(s).id || s.jobId;

export default function SavedJobsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [toast, setToast] = useState(null); // { message, undo }
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recent");

  const pending = useRef(null); // { jobId, item, index, timer }
  const toastTimer = useRef(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  const load = async () => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await getSavedJobs();
      const arr = res?.savedJobs || res?.data || res || [];
      setSaved(Array.isArray(arr) ? arr : []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load saved jobs");
    } finally {
      clearTimeout(wakeTimer);
      setWake(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  // On leaving the page, commit any pending unsave so it isn't lost.
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      const p = pending.current;
      if (p) {
        clearTimeout(p.timer);
        unsaveJob(p.jobId).catch(() => {});
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // Toast helpers
  // --------------------------------------------------------------------------
  const flash = (message, ms = 3000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  const reinsert = (item, index) =>
    setSaved((prev) => {
      const next = [...prev];
      next.splice(Math.min(index, next.length), 0, item);
      return next;
    });

  // --------------------------------------------------------------------------
  // Unsave (optimistic, with 5s undo before the request is sent)
  // --------------------------------------------------------------------------
  const commit = async (p) => {
    try {
      await unsaveJob(p.jobId);
    } catch (err) {
      reinsert(p.item, p.index);
      flash(err instanceof ApiError ? err.message : "Couldn't remove job. Restored.");
    }
  };

  const handleUnsave = (item) => {
    const jobId = jobIdOf(item);

    // Commit the previous pending removal right away.
    if (pending.current) {
      clearTimeout(pending.current.timer);
      commit(pending.current);
      pending.current = null;
    }

    const index = saved.indexOf(item);
    setSaved((prev) => prev.filter((s) => s !== item));

    const p = { jobId, item, index };
    p.timer = setTimeout(() => {
      pending.current = null;
      setToast(null);
      commit(p);
    }, UNDO_MS);
    pending.current = p;

    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: "Removed from saved", undo: true });
  };

  const handleUndo = () => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    reinsert(p.item, p.index);
    setToast(null);
  };

  // --------------------------------------------------------------------------
  // Derived list: categories, filter, sort
  // --------------------------------------------------------------------------
  const categories = useMemo(() => {
    const set = new Set();
    saved.forEach((s) => jobOf(s).category && set.add(jobOf(s).category));
    return ["All", ...Array.from(set)];
  }, [saved]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = saved.filter((s) => {
      const j = jobOf(s);
      if (category !== "All" && j.category !== category) return false;
      if (!q) return true;
      return [j.title, j.category, j.location, j.compensation]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    if (sort === "az") {
      list = [...list].sort((a, b) =>
        String(jobOf(a).title || "").localeCompare(String(jobOf(b).title || ""))
      );
    }
    return list;
  }, [saved, query, category, sort]);

  const filtersActive = query.trim() !== "" || category !== "All";
  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };
  const showControls = saved.length >= 4 || filtersActive;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 border-b-2 border-[var(--color-ink)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-[var(--shadow)]">
            <Bookmark size={22} className="fill-current" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-none tracking-tight text-[var(--color-ink)]">
              Saved jobs
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-muted)]">
              Your shortlist. Apply before they close.
            </p>
          </div>
        </div>
        {!loading && !error && saved.length > 0 && (
          <span className="shrink-0 rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-bold text-[var(--color-surface)]">
            {saved.length} saved
          </span>
        )}
      </div>

      {/* Server wake-up banner */}
      {wake && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)]"
        >
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Waking up the server, this can take up to a minute.
        </div>
      )}

      {/* Controls */}
      {!loading && !error && showControls && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search saved jobs</span>
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, location, pay"
                className="w-full rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
              />
            </label>
            <label>
              <span className="sr-only">Sort saved jobs</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] sm:w-auto"
              >
                <option value="recent">Recently saved</option>
                <option value="az">Title A to Z</option>
              </select>
            </label>
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {categories.map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={active}
                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : saved.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Tap the bookmark on any job to keep it here."
          actionLabel="Browse jobs"
          onAction={() => router.push("/student/jobs")}
          icon={Bookmark}
        />
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-border)] px-6 py-10 text-center">
          <p className="text-sm font-bold text-[var(--color-ink)]">No matches</p>
          <p className="text-xs text-[var(--color-muted)]">Nothing in your saved jobs fits those filters.</p>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} aria-hidden="true" /> Clear filters
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((s) => {
            const job = jobOf(s);
            const jid = jobIdOf(s);
            return (
              <li key={s.id || jid}>
                <Card className="group relative overflow-hidden border-2 border-[var(--color-border)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {job.category && (
                        <span className="mb-2 inline-block rounded-md bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-accent)]">
                          {job.category}
                        </span>
                      )}
                      <h2 className="text-base font-bold leading-snug text-[var(--color-ink)]">
                        {/* after:inset-0 makes the whole card a link target */}
                        <Link
                          href={`/student/jobs/${jid}`}
                          className="inline-flex items-start gap-1 after:absolute after:inset-0 after:content-[''] hover:text-[var(--color-accent)] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-accent)]"
                        >
                          <span>{job.title}</span>
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                          />
                        </Link>
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} aria-hidden="true" />
                            {job.location}
                          </span>
                        )}
                        {job.compensation && (
                          <span className="inline-flex items-center gap-1 font-bold text-[var(--color-ink)]">
                            <Banknote size={13} aria-hidden="true" />
                            {job.compensation}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsave(s)}
                      aria-label={`Unsave ${job.title || "job"}`}
                      className="relative z-10 shrink-0"
                    >
                      <BookmarkX size={14} aria-hidden="true" />
                      <span className="hidden sm:inline">Unsave</span>
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* Toast */}
      <div aria-live="polite" role="status">
        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)] shadow-[var(--shadow)]">
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={handleUndo}
                className="font-extrabold underline underline-offset-4 hover:opacity-80"
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}