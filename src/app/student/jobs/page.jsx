"use client";
// ============================================================================
// SECTION: STUDENT - BROWSE JOBS
// ============================================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  applyToJob,
  reportJob,
  getMyApplications,
} from "@/lib/endpoints";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetail } from "@/components/jobs/JobDetail";
import { JobFilters } from "@/components/jobs/JobFilters";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { ReportModal } from "@/components/jobs/ReportModal";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import {
  Briefcase,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Flag,
  CheckCircle2,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function StudentJobsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [selectedId, setSelectedId] = useState(
    params.get("job") ? Number(params.get("job")) : null,
  );
  const [search, setSearch] = useState(params.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState(params.get("category") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const reqId = useRef(0);
  const toastTimer = useRef(null);
  const listRef = useRef(null);

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const flash = (message, ms = 2200) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Desktop shows the split detail panel; mobile navigates to the job page.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Debounce search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const categories = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => j.category && set.add(j.category));
    return Array.from(set);
  }, [jobs]);
  const locations = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => j.location && set.add(j.location));
    return Array.from(set);
  }, [jobs]);

  // --------------------------------------------------------------------------
  // Data
  // --------------------------------------------------------------------------
  const fetchData = async (page = 1) => {
    const id = ++reqId.current; // ignore stale responses
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await listJobs({
        search: debouncedSearch || undefined,
        category: category || undefined,
        location: location || undefined,
        page,
        limit: PAGE_SIZE,
      });
      if (id !== reqId.current) return;
      setJobs(res?.jobs || res?.data || []);
      setPagination(
        res?.pagination || { page, limit: PAGE_SIZE, total: 0, totalPages: 1 },
      );
      listRef.current?.scrollTo({ top: 0 });
    } catch (err) {
      if (id !== reqId.current) return;
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load jobs");
    } finally {
      clearTimeout(wakeTimer);
      if (id === reqId.current) {
        setWake(false);
        setLoading(false);
      }
    }
  };

  // Jobs: refetch when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, location]);

  // Saved + applied: fetch once
  useEffect(() => {
    (async () => {
      try {
        const s = await getSavedJobs();
        const arr = s?.savedJobs || s?.data || s || [];
        const ids = new Set();
        arr.forEach((x) => {
          const jid = x.jobId || x.job?.id || x.id;
          if (jid) ids.add(Number(jid));
        });
        setSavedIds(ids);
      } catch {}
      try {
        const a = await getMyApplications();
        const arr = a?.applications || a?.data || a || [];
        const ids = new Set();
        arr.forEach((x) => {
          if (x.jobId) ids.add(Number(x.jobId));
        });
        setAppliedIds(ids);
      } catch {}
    })();
  }, []);

  // On desktop, show the first job by default so the panel is never empty.
  const selected = useMemo(
    () =>
      jobs.find((j) => j.id === selectedId) ||
      (isDesktop ? jobs[0] : null) ||
      null,
    [jobs, selectedId, isDesktop],
  );

  const updateUrl = (id) => {
    const q = new URLSearchParams(params.toString());
    if (id) q.set("job", String(id));
    else q.delete("job");
    router.replace(`/student/jobs${q.toString() ? `?${q.toString()}` : ""}`);
  };

  const handleSelect = (job) => {
    if (!isDesktop) {
      router.push(`/student/jobs/${job.id}`);
      return;
    }
    setSelectedId(job.id);
    updateUrl(job.id);
  };

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const toggleSave = async (job) => {
    const id = job.id;
    const was = savedIds.has(id);
    const flip = (set, on) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    };
    setSavedIds((prev) => flip(prev, !was));
    try {
      if (was) await unsaveJob(id);
      else await saveJob(id);
      flash(was ? "Removed from saved" : "Saved job");
    } catch (err) {
      setSavedIds((prev) => flip(prev, was)); // revert
      flash(err instanceof ApiError ? err.message : "Failed to update", 2800);
    }
  };

  // Errors are rethrown so the modal can show them.
  const handleApply = async (cover) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await applyToJob(selected.id, cover);
      setAppliedIds((prev) => new Set([...prev, selected.id]));
      setApplyOpen(false);
      router.push("/student/applications");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async (reason) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await reportJob(selected.id, reason);
      setReportOpen(false);
      flash("Report submitted");
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setLocation("");
    router.replace("/student/jobs");
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden lg:gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--color-ink)] pb-2">
        <h1 className="text-xl font-extrabold leading-none text-[var(--color-ink)] sm:text-2xl">
          Browse jobs
        </h1>
        {!loading && !error && (
          <span className="shrink-0 rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs font-bold text-[var(--color-surface)]">
            {pagination.total || jobs.length}{" "}
            {(pagination.total || jobs.length) === 1 ? "job" : "jobs"}
          </span>
        )}
      </div>

      <JobFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        location={location}
        setLocation={setLocation}
        categories={categories}
        locations={locations}
        onClear={clearFilters}
        drawerOpen={filterDrawerOpen}
        onOpenDrawer={() => setFilterDrawerOpen(true)}
        onCloseDrawer={() => setFilterDrawerOpen(false)}
      />

      {wake && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)]"
        >
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Waking up the server, this can take up to a minute.
        </div>
      )}

      {loading ? (
        <div
          className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]"
          aria-busy="true"
        >
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => fetchData(pagination.page)}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
          icon={Briefcase}
        />
      ) : (
        <>
          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
            <section
              aria-label="Job feed"
              className="flex min-h-0 flex-col overflow-hidden"
            >
              <div
                ref={listRef}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto custom-scrollbar
                  divide-y divide-[var(--color-border)] lg:divide-y-0
                  lg:gap-2.5 lg:pr-1.5 lg:pb-3"
              >
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    selected={isDesktop && selected?.id === job.id}
                    onSelect={() => handleSelect(job)}
                    saved={savedIds.has(job.id)}
                    onToggleSave={toggleSave}
                    applied={appliedIds.has(job.id)}
                  />
                ))}
              </div>
            </section>

            {/* Right detail panel */}
            <div className="hidden min-h-0 overflow-hidden rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface)] lg:flex lg:flex-col">
              <JobDetail
                job={selected}
                compact
                hideActions
                saved={selected ? savedIds.has(selected.id) : false}
                applied={selected ? appliedIds.has(selected.id) : false}
                disabled={actionLoading}
              />
            </div>
          </div>

          {/* ================================================================
              UNIFIED BOTTOM BAR
              Aligns visually with the sidebar's account block footer.
              Left: pagination | Right: Apply now / Save / Report
              ================================================================ */}
          <div className="shrink-0 border-t-2 border-[var(--color-ink)] bg-[var(--color-surface)] ">
            <div className="flex items-center lg:justify-between gap-3 lg:pt-6">
              {/* Pagination */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-[var(--color-muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchData(pagination.page - 1)}
                    className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[var(--color-border-strong)] px-2.5 text-[11px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft size={13} aria-hidden="true" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchData(pagination.page + 1)}
                    className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-[var(--color-brand)] bg-[var(--color-brand)] px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[var(--color-brand-2)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={13} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Apply / Save / Report — shown only on desktop when a job is selected */}
              {selected && isDesktop && (
                <div className="flex items-center gap-2">
                  {selected && appliedIds.has(selected.id) ? (
                    <div className="flex items-center gap-2 rounded-[4px] border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 size={14} />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setApplyOpen(true)}
                      disabled={
                        actionLoading || selected?.status === "CLOSED"
                      }
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[4px] bg-[var(--color-apply)] px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[var(--color-apply-hover)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {selected?.status === "CLOSED"
                        ? "Applications Closed"
                        : "Apply now"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => selected && toggleSave(selected)}
                    title={
                      savedIds.has(selected.id)
                        ? "Remove from saved"
                        : "Save job"
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <Bookmark
                      size={14}
                      className={
                        savedIds.has(selected.id)
                          ? "fill-[var(--color-accent)] text-[var(--color-accent)]"
                          : "text-[var(--color-muted)]"
                      }
                    />
                    <span>{savedIds.has(selected.id) ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    title="Report this job posting"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[var(--color-border)] text-[var(--color-muted)] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
        loading={actionLoading}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
        loading={actionLoading}
      />

      <div aria-live="polite" role="status">
        {toast && (
          <div className="fixed bottom-20 lg:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-[var(--color-surface)] shadow-[var(--shadow)]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
