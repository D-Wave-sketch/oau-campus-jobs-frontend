"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Radio,
  RefreshCw,
  Search,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomeJobCard } from "@/components/home/HomeJobCard";
import { HomeJobDetail } from "@/components/home/HomeJobDetail";
import { useAuth } from "@/context/AuthContext";
import { listJobs } from "@/lib/endpoints";
import { isJobOpen } from "@/components/jobs/jobFormat";

// ============================================================================
// SECTION: CONSTANTS
// ============================================================================
const PAGE_SIZE = 12;
const CAMPUS_SEARCHES = [
  { query: "4K video club promo", detail: "$100 / club promo shoot" },
  { query: "React Native debugging", detail: "Before midnight" },
  { query: "Dorm move-out help", detail: "Truck + hands / Friday" },
];

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
          <div className="h-3.5 w-3/4 rounded-md bg-[var(--color-surface-3)]" />
          <div className="mt-3 h-3 w-1/2 rounded-md bg-[var(--color-surface-3)]" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-16 rounded-md bg-[var(--color-surface-3)]" />
            <div className="h-5 w-14 rounded-md bg-[var(--color-surface-3)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailPlaceholder() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]">
        <Briefcase size={19} />
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

  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [applied, setApplied] = useState({ search: "", location: "" });

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // First-launch onboarding redirect
  useEffect(() => {
    try {
      if (localStorage.getItem("oau_campus_jobs_onboarded") !== "true") {
        router.replace("/onboarding");
      }
    } catch {
      // Storage unavailable: skip onboarding
    }
  }, [router]);

  // Signed-in users go to their dashboard
  useEffect(() => {
    if (status !== "authenticated") return;
    if (role === "STUDENT") router.replace("/student/jobs");
    else if (role === "EMPLOYER") router.replace("/employer");
    else if (role === "ADMIN") router.replace("/admin/users");
  }, [status, role, router]);

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
          : list,
      );
      setMeta(m);
      setPage(pageToLoad);

      const totalPages = m?.totalPages ?? m?.pages;
      setHasMore(
        totalPages ? pageToLoad < totalPages : list.length === PAGE_SIZE,
      );
    } catch (err) {
      setError(err?.message || "Could not load jobs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadJobs(1, applied);
  }, [applied, loadJobs]);

  useEffect(() => {
    if (!loading || jobs.length > 0) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, [loading, jobs.length]);

  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!jobs.some((j) => j.id === selectedId)) setSelectedId(jobs[0].id);
  }, [jobs, selectedId]);

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
    setSheetOpen(true);
  };

  const selectedJob = jobs.find((j) => j.id === selectedId) || null;
  const activeJobs = jobs.filter(isJobOpen).slice(0, 3);
  const hasQuery = Boolean(applied.search || applied.location);
  const total = meta?.total ?? meta?.totalItems ?? null;
  const isAnonymous = status !== "authenticated";

  return (
    <div className="h-dvh overflow-hidden bg-[var(--color-surface-2)] flex flex-col lg:flex-row">
      {/* Collapsible Sidebar */}
      <Sidebar role={role} />

      {/* Main canvas */}
      <div className="flex-1 flex flex-col min-w-0 border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-300">
        <Navbar />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <section className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="grid gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:gap-8 lg:px-8 lg:py-5">
              <div className="flex flex-col justify-center">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-brand)]">
                  OAU / CAMPUS WORK BOARD
                </p>
                <h1 className="mt-1 text-[26px] font-bold leading-tight text-[var(--color-ink)] sm:text-[30px]">
                  Find work between lectures.
                </h1>
                <form
                  onSubmit={submitSearch}
                  role="search"
                  className="mt-3 grid gap-2 border border-[var(--color-border-strong)] bg-[var(--color-background)] p-1.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(150px,0.8fr)_auto]"
                >
                  <label className="flex min-w-0 items-center gap-2 px-2.5">
                    <Search
                      size={16}
                      className="shrink-0 text-[var(--color-muted)]"
                    />
                    <span className="sr-only">Job title or keywords</span>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Find a tutor, video editor..."
                      className="w-full bg-transparent py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:outline-none"
                    />
                  </label>
                  <label className="flex min-w-0 items-center gap-2 border-t border-[var(--color-border)] px-2.5 sm:border-l sm:border-t-0">
                    <MapPin
                      size={15}
                      className="shrink-0 text-[var(--color-muted)]"
                    />
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
                    id="home-search-btn"
                    className="h-10 rounded-[4px] bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-2)] active:translate-y-px"
                  >
                    Search jobs
                  </button>
                </form>
                <p className="mt-2 text-[11px] text-[var(--color-muted)]">
                  Posting a gig?{" "}
                  <Link
                    href="/register/employer"
                    className="font-semibold text-[var(--color-brand)] underline underline-offset-2"
                  >
                    List it here
                  </Link>
                </p>
              </div>

              <aside
                aria-label="Active campus gigs"
                className="border-t border-[var(--color-border)] pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-ink)]">
                    <Radio size={14} className="text-[var(--color-brand)]" />
                    {activeJobs.length > 0
                      ? "Live from campus"
                      : "Try a campus search"}
                  </h2>
                  <span className="font-mono text-[10px] text-[var(--color-muted)]">
                    {activeJobs.length > 0 ? "LATEST POSTS" : "SEARCH IDEAS"}
                  </span>
                </div>
                {activeJobs.length > 0 ? (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {activeJobs.map((job) => (
                      <li key={job.id}>
                        <button
                          type="button"
                          onClick={() => selectJob(job.id)}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 text-left hover:bg-[var(--color-surface-2)]"
                        >
                          <span className="truncate text-[12px] font-semibold text-[var(--color-ink)]">
                            {job.title}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-brand)]">
                            {job.compensation || "OPEN"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {CAMPUS_SEARCHES.map(({ query, detail }) => (
                      <li key={query}>
                        <button
                          type="button"
                          onClick={() => {
                            setQ(query);
                            setLoc("");
                            setApplied({ search: query, location: "" });
                          }}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 text-left hover:bg-[var(--color-surface-2)]"
                        >
                          <span className="truncate text-[12px] font-semibold text-[var(--color-ink)]">
                            {query}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--color-muted)]">
                            {detail}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            </div>
          </section>

          {/* Feed + preview */}
          <section className="w-full flex-1 px-3 py-3 sm:px-5 lg:px-6 min-h-0 overflow-hidden">
            <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-5">
              {/* Left: feed */}
              <div className="min-w-0 h-full overflow-y-auto pb-12 custom-scrollbar">
                {/* Sign-in prompt for guests */}
                {isAnonymous && (
                  <div className="mb-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
                      Create a student account to apply
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--color-muted)]">
                      Applications, saved jobs and your profile all in one
                      place.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/register/student"
                        className="inline-flex h-9 items-center rounded-[4px] bg-[var(--color-brand)] px-4 text-[12px] font-semibold text-white hover:bg-[var(--color-brand-2)] transition-colors"
                      >
                        Register as a student
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex h-9 items-center rounded-[4px] border border-[var(--color-border-strong)] px-4 text-[12px] font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  </div>
                )}

                {/* Results heading */}
                {!loading && !error && jobs.length > 0 && (
                  <div className="mb-2 flex items-center justify-between border-b border-[var(--color-ink)] pb-2">
                    <h2 className="text-[14px] font-bold text-[var(--color-ink)]">
                      {hasQuery ? "Search results" : "Open campus work"}
                    </h2>
                    <span className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
                      {total ?? jobs.length}{" "}
                      {(total ?? jobs.length) === 1 ? "job" : "jobs"}
                    </span>
                  </div>
                )}

                {jobs.length > 0 && (
                  <div
                    aria-hidden="true"
                    className="grid grid-cols-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] sm:grid-cols-[minmax(76px,0.65fr)_minmax(92px,0.75fr)_minmax(110px,0.85fr)_minmax(140px,1.45fr)]"
                  >
                    <span>Pay rate</span>
                    <span>Deadline</span>
                    <span className="hidden sm:block">Campus location</span>
                    <span className="col-span-2 sm:hidden">
                      Campus location / listing
                    </span>
                    <span className="hidden sm:block">Job listing</span>
                  </div>
                )}

                {/* Cold-start note */}
                {slow && (
                  <div
                    role="status"
                    className="mb-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[12px] text-[var(--color-muted)]"
                  >
                    The server is waking up. The first load may take up to a
                    minute.
                  </div>
                )}

                {loading && jobs.length === 0 && <FeedSkeleton />}

                {/* Error */}
                {!loading && error && jobs.length === 0 && (
                  <div
                    role="alert"
                    className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center"
                  >
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadJobs(1, applied)}
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-[4px] border border-[var(--color-border-strong)] px-4 text-[12px] font-semibold hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      <RefreshCw size={13} />
                      Try again
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && jobs.length === 0 && (
                  <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {hasQuery
                        ? "No jobs match your search"
                        : "No open jobs yet"}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--color-muted)]">
                      {hasQuery
                        ? "Try different keywords or clear the location."
                        : "Check back soon as employers post new roles."}
                    </p>
                    {hasQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="mt-4 inline-flex h-9 items-center rounded-[4px] border border-[var(--color-border-strong)] px-4 text-[12px] font-semibold hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}

                {/* Cards */}
                {jobs.length > 0 && (
                  <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
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
                      className="inline-flex h-9 items-center rounded-[4px] border border-[var(--color-border-strong)] px-5 text-[12px] font-semibold hover:bg-[var(--color-surface-2)] disabled:opacity-60 transition-colors"
                    >
                      {loadingMore ? "Loading…" : "Show more jobs"}
                    </button>
                  </div>
                )}

                {error && jobs.length > 0 && (
                  <p
                    role="alert"
                    className="mt-3 text-center text-[12px] text-[var(--color-muted)]"
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Right: preview panel (desktop) */}
              <aside
                aria-label="Job preview"
                className="hidden lg:block h-full min-h-0 overflow-hidden rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface)]"
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

        {/* Mobile job sheet */}
        {sheetOpen && selectedJob && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedJob.title}
            className="fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)] lg:hidden"
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Back to jobs"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                <ArrowLeft size={17} />
              </button>
              <span className="truncate text-sm font-semibold text-[var(--color-ink)] font-[family-name:var(--font-poppins)]">
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
