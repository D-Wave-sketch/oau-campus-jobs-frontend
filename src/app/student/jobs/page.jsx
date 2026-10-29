"use client";
// ============================================================================
// SECTION: STUDENT - BROWSE JOBS
// ============================================================================
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listJobs, getSavedJobs, saveJob, unsaveJob, applyToJob, reportJob, getMyApplications } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetail } from "@/components/jobs/JobDetail";
import { JobFilters } from "@/components/jobs/JobFilters";
import { ApplyModal } from "@/components/jobs/ApplyModal";
import { ReportModal } from "@/components/jobs/ReportModal";
import { SkeletonCard } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";
import { Briefcase } from "lucide-react";

export default function StudentJobsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wake, setWake] = useState(false);
  const [selectedId, setSelectedId] = useState(params.get("job") ? Number(params.get("job")) : null);
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  const cvMissing = !(profile?.cvUrl);

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

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError("");
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      const res = await listJobs({ search: search || undefined, category: category || undefined, location: location || undefined, page, limit: 10 });
      setJobs(res?.jobs || res?.data || []);
      setPagination(res?.pagination || { page, limit: 10, total: 0, totalPages: 1 });
      clearTimeout(wakeTimer);
      setWake(false);
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) setError(err.message);
      else setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, location]);

  const selected = useMemo(() => jobs.find((j) => j.id === selectedId) || null, [jobs, selectedId]);

  const updateUrl = (id) => {
    const q = new URLSearchParams(params.toString());
    if (id) q.set("job", String(id));
    else q.delete("job");
    router.replace(`/student/jobs${q.toString() ? `?${q.toString()}` : ""}`);
  };

  const toggleSave = async (job) => {
    const id = job.id;
    const was = savedIds.has(id);
    const next = new Set(savedIds);
    if (was) next.delete(id); else next.add(id);
    setSavedIds(next);
    try {
      if (was) await unsaveJob(id);
      else await saveJob(id);
      setToast(was ? "Removed from saved" : "Saved job");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      setSavedIds(savedIds);
      if (err instanceof ApiError) setToast(err.message);
      else setToast("Failed to update");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handleApply = async (cover) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await applyToJob(selected.id, cover);
      setAppliedIds(new Set([...appliedIds, selected.id]));
      setApplyOpen(false);
      router.push("/student/applications");
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
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
      setToast("Report submitted");
      setTimeout(() => setToast(""), 2000);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    router.replace("/student/jobs");
  };

  return (
    <div className="flex flex-col gap-3">
      {cvMissing && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center gap-2">
          <span className="font-semibold">Add your CV</span> in Profile to improve your chances.
        </div>
      )}
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
      />
      {wake && <div className="text-xs text-[var(--color-subtle)]">Waking up the server, this can take up to a minute</div>}
      {loading ? (
        <div className="grid gap-3 lg:grid-cols-[340px_1fr] h-[600px] items-start">
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="hidden lg:block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchData(pagination.page)} />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try adjusting your filters" actionLabel="Clear filters" onAction={clearFilters} icon={Briefcase} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(340px,380px)_1fr] items-start">
            {/* Left Feed Column - Independent Scroll */}
            <div className="flex flex-col gap-2.5 lg:h-[calc(100vh-210px)] overflow-y-auto pr-1.5 pb-6 custom-scrollbar">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedId === job.id}
                  onSelect={() => {
                    setSelectedId(job.id);
                    updateUrl(job.id);
                  }}
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                  applied={appliedIds.has(job.id)}
                />
              ))}
            </div>

            {/* Right Detail Preview - Centered & Fitted */}
            <div className="hidden lg:flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm lg:h-[calc(100vh-210px)] overflow-hidden">
              <JobDetail
                job={selected}
                onApply={() => setApplyOpen(true)}
                onSave={() => selected && toggleSave(selected)}
                onReport={() => setReportOpen(true)}
                saved={selected ? savedIds.has(selected.id) : false}
                applied={selected ? appliedIds.has(selected.id) : false}
                disabled={actionLoading}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mt-4">
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)} className="px-2 py-1 border rounded-md hover:bg-[var(--color-surface-2)] disabled:opacity-50 disabled:pointer-events-none">Previous</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)} className="px-2 py-1 border rounded-md hover:bg-[var(--color-surface-2)] disabled:opacity-50 disabled:pointer-events-none">Next</button>
            </div>
          </div>
        </>
      )}
      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} onSubmit={handleApply} loading={actionLoading} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onSubmit={handleReport} loading={actionLoading} />
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm shadow-[var(--shadow)]">
          {toast}
        </div>
      )}
    </div>
  );
}