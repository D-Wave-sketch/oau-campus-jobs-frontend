"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Briefcase, MapPin, RefreshCw, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomeJobCard } from "@/components/home/HomeJobCard";
import { HomeJobDetail } from "@/components/home/HomeJobDetail";
import { useAuth } from "@/context/AuthContext";
import { listJobs } from "@/lib/endpoints";

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================
const PAGE_SIZE = 12;

// ============================================================================
// SECTION: SMALL PRESENTATION PIECES
// ============================================================================
function FeedSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="h-4 w-3/4 rounded bg-[var(--color-surface-3)]" />
          <div className="mt-3 h-3 w-1/2 rounded bg-[var(--color-surface-3)]" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-20 rounded bg-[var(--color-surface-3)]" />
            <div className="h-6 w-16 rounded bg-[var(--color-surface-3)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
        <Briefcase size={20} />
      </div>
      <p className="text-sm text-[var(--color-muted)]">
        Select a job to see the full details.
      </p>
    </div>
  );
}

// ============================================================================
// SECTION: PAGE
// ============================================================================
export default function Home() {
  const router = useRouter();
  const { status, role } = useAuth();

  // --------------------------------------------------------------------------
  // STATE: search inputs (typed) vs applied query (what was submitted)
  // --------------------------------------------------------------------------
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [applied, setApplied] = useState({ search: "", location: "" });

  // --------------------------------------------------------------------------
  // STATE: feed data
  // --------------------------------------------------------------------------
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);

  // --------------------------------------------------------------------------
  // STATE: selection (desktop panel) and mobile sheet
  // --------------------------------------------------------------------------
  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // --------------------------------------------------------------------------
  // EFFECT: first-launch onboarding redirect
  // --------------------------------------------------------------------------
  useEffect(() => {
    try {
      if (localStorage.getItem("oau_campus_jobs_onboarded") !== "true") {
        router.replace("/onboarding");
      }
    } catch {
      // Storage unavailable: skip onboarding rather than block the page.
    }
  }, [router]);

  // --------------------------------------------------------------------------
  // EFFECT: signed-in users go to their own dashboard
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (status !== "authenticated") return;
    if (role === "STUDENT") router.replace("/student/jobs");
    else if (role === "EMPLOYER") router.replace("/employer");
    else if (role === "ADMIN") router.replace("/admin/users");
  }, [status, role, router]);

  // --------------------------------------------------------------------------
  // DATA: load a page of jobs (page 1 replaces, later pages append)
  // --------------------------------------------------------------------------
  const loadJobs = useCallback(async (pageToLoad, query) => {
    const append = pageToLoad > 1;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const params = { page: pageToLoad, limit: PAGE_SIZE };
      if (query.search) params.search = query.search;
      if (query.location) params.location = query.location;

      const res = await listJobs(params);
      const items = res?.jobs || res?.data || [];
      const list = Array.isArray(items) ? items : [];
      const m = res?.meta || res?.pagination || null;

      setJobs((prev) =>
        append
          ? [...prev, ...list.filter((n) => !prev.some((p) => p.id === n.id))]
          : list
      );
      setMeta(m);
      setPage(pageToLoad);

      const totalPages = m?.totalPages ?? m?.pages;
      setHasMore(
        totalPages ? pageToLoad < totalPages : list.length === PAGE_SIZE
      );
    } catch (err) {
      setError(err?.message || "Could not load jobs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reload page 1 whenever the applied query changes
  useEffect(() => {
    loadJobs(1, applied);
  }, [applied, loadJobs]);

  // --------------------------------------------------------------------------
  // EFFECT: show a "server is waking up" note if the first load is slow
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!loading || jobs.length > 0) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading, jobs.length]);

  // --------------------------------------------------------------------------
  // EFFECT: keep a valid selection (auto-select first job on desktop)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!jobs.some((j) => j.id === selectedId)) setSelectedId(jobs[0].id);
  }, [jobs, selectedId]);

  // --------------------------------------------------------------------------
  // EFFECT: mobile sheet behaviour (scroll lock + Escape to close)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const submitSearch = (e) => {
    e.preventDefault();
    setApplied({ search: q.trim(), location: loc.trim() });
  };

  const clearSearch = () => {
    setQ("");
    setLoc("");
    setApplied({ search: "", location: "" });
  };

  const selectJob = (id) => {
    setSelectedId(id);
    setSheetOpen(true); // only visible below the lg breakpoint
  };

  // --------------------------------------------------------------------------
  // DERIVED
  // --------------------------------------------------------------------------
  const selectedJob = jobs.find((j) => j.id === selectedId) || null;
  const hasQuery = Boolean(applied.search || applied.location);
  const total = meta?.total ?? meta?.totalItems ?? null;
  const isAnonymous = status !== "authenticated";

  // ==========================================================================
  // SECTION: RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Collapsible Sidebar (Guest / User) */}
      <Sidebar role={role} />

      {/* Wrapped Canvas around the page with rounded corners */}
      <div className="flex-1 flex flex-col min-w-0 lg:my-2.5 lg:mr-2.5 lg:rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden transition-all duration-300">
        <Navbar />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ---------------- Search strip ---------------- */}
          <section className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:py-5">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-3xl">
              Find campus work that fits around your lectures
            </h1>

            <form
              onSubmit={submitSearch}
              role="search"
              className="mt-4 flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow)] sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
            >
              <label className="flex flex-1 items-center gap-2 px-3">
                <Search size={18} className="shrink-0 text-[var(--color-subtle)]" />
                <span className="sr-only">Job title or keywords</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Job title or keywords"
                  className="w-full bg-transparent py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:outline-none"
                />
              </label>

              <div className="hidden h-7 w-px bg-[var(--color-border)] sm:block" />

              <label className="flex flex-1 items-center gap-2 px-3">
                <MapPin size={18} className="shrink-0 text-[var(--color-subtle)]" />
                <span className="sr-only">Campus location</span>
                <input
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="Campus location"
                  className="w-full bg-transparent py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="h-11 rounded-full bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Find jobs
              </button>
            </form>

            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Hiring on campus?{" "}
              <Link
                href="/register/employer"
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                Register as an employer
              </Link>
            </p>
          </div>
        </section>

        {/* ---------------- Feed + preview ---------------- */}
        <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 sm:px-6 min-h-0 overflow-hidden">
          <div className="grid gap-6 h-full lg:grid-cols-[minmax(340px,430px)_1fr] min-h-0">
            {/* ===== Left: feed (independently scrollable) ===== */}
            <div className="min-w-0 h-full overflow-y-auto pr-2 pb-12 custom-scrollbar">
              {/* Sign-in prompt for visitors */}
              {isAnonymous && (
                <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    Create a student account to apply
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Applications, saved jobs and your profile all live in one
                    place.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/register/student"
                      className="inline-flex h-10 items-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-accent-2)]"
                    >
                      Register as a student
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex h-10 items-center rounded-full border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              )}

              {/* Results heading */}
              {!loading && !error && jobs.length > 0 && (
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[var(--color-ink)]">
                    {hasQuery ? "Search results" : "Jobs for you"}
                  </h2>
                  <span className="text-xs text-[var(--color-subtle)]">
                    {total ?? jobs.length} {(total ?? jobs.length) === 1 ? "job" : "jobs"}
                  </span>
                </div>
              )}

              {/* Cold-start note */}
              {slow && (
                <div
                  role="status"
                  className="mb-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted)]"
                >
                  The server is waking up. The first load can take up to a
                  minute.
                </div>
              )}

              {/* Loading */}
              {loading && jobs.length === 0 && <FeedSkeleton />}

              {/* Error */}
              {!loading && error && jobs.length === 0 && (
                <div
                  role="alert"
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center"
                >
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => loadJobs(1, applied)}
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-5 text-sm font-semibold hover:bg-[var(--color-surface-2)]"
                  >
                    <RefreshCw size={14} />
                    Try again
                  </button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && jobs.length === 0 && (
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {hasQuery ? "No jobs match your search" : "No open jobs yet"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {hasQuery
                      ? "Try different keywords or clear the location."
                      : "Check back soon as employers post new roles."}
                  </p>
                  {hasQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mt-4 inline-flex h-10 items-center rounded-full border border-[var(--color-border-strong)] px-5 text-sm font-semibold hover:bg-[var(--color-surface-2)]"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}

              {/* Cards */}
              {jobs.length > 0 && (
                <ul className="space-y-3">
                  {jobs.map((job) => (
                    <li key={job.id}>
                      <HomeJobCard
                        job={job}
                        selected={job.id === selectedId}
                        onSelect={selectJob}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {/* Load more */}
              {jobs.length > 0 && hasMore && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => loadJobs(page + 1, applied)}
                    className="inline-flex h-10 items-center rounded-full border border-[var(--color-border-strong)] px-6 text-sm font-semibold hover:bg-[var(--color-surface-2)] disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Show more jobs"}
                  </button>
                </div>
              )}

              {/* Load-more failure keeps the existing list visible */}
              {error && jobs.length > 0 && (
                <p role="alert" className="mt-3 text-center text-sm text-[var(--color-muted)]">
                  {error}
                </p>
              )}
            </div>

            {/* ===== Right: preview panel (independently scrollable desktop only) ===== */}
            <aside
              aria-label="Job preview"
              className="hidden lg:block h-full overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] custom-scrollbar"
            >
              {selectedJob ? (
                <HomeJobDetail key={selectedJob.id} job={selectedJob} />
              ) : (
                !loading && <DetailPlaceholder />
              )}
            </aside>
          </div>
        </section>
      </main>

      {/* ---------------- Mobile sheet ---------------- */}
      {sheetOpen && selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedJob.title}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)] lg:hidden"
        >
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Back to jobs"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--color-surface-2)]"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="truncate text-sm font-semibold text-[var(--color-ink)]">
              {selectedJob.title}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HomeJobDetail job={selectedJob} showStickyCta />
          </div>
        </div>
      )}
      </div>

      <BottomNav role={role} />
    </div>
  );
}