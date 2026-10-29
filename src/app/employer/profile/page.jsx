"use client";
// ============================================================================
// SECTION: EMPLOYER - PROFILE
// ============================================================================
import { useState, useEffect } from "react";
import { getMe, updateEmployerProfile } from "@/lib/endpoints";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { ApiError } from "@/lib/api";

export default function EmployerProfilePage() {
  const { profile, loadProfile } = useAuth();
  const [form, setForm] = useState({
    organizationName: "",
    description: "",
    website: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wake, setWake] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = profile?.data || profile;
    if (p) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        organizationName: p.organizationName || "",
        description: p.description || "",
        website: p.website || "",
        phone: p.phone || "",
      });
    }
  }, [profile]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const next = {
      organizationName: form.organizationName.trim() || undefined,
      description: form.description.trim() || undefined,
      website: form.website.trim() || undefined,
      phone: form.phone.trim() || undefined,
    };
    // At least one field required by schema
    if (!Object.values(next).some((v) => v !== undefined)) {
      setError("Provide at least one field to update.");
      return;
    }
    setLoading(true);
    const wakeTimer = setTimeout(() => setWake(true), 4000);
    try {
      await updateEmployerProfile(next, undefined);
      clearTimeout(wakeTimer);
      setWake(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Refresh profile so verification banner reflects changes
      await loadProfile?.();
    } catch (err) {
      clearTimeout(wakeTimer);
      setWake(false);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            setFieldErrors((prev) => ({ ...prev, [field]: message }));
          }
        }
      } else {
        setError(err.message || "Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading…" />;
  if (error) return <ErrorState message={error} />;

  const p = profile?.data || profile;
  const verificationStatus = p?.verificationStatus;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">Employer profile</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Manage your organization&apos;s public details</p>
      </div>
      {wake && <div className="text-xs text-[var(--color-muted)]">Waking up the server, this can take up to a minute</div>}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Organization details</h2>
          {verificationStatus && (
            <span className={`text-[10px] font-medium rounded-md px-2 py-0.5 ${
              verificationStatus === "VERIFIED"
                ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                : verificationStatus === "REJECTED"
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              Verification: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1).toLowerCase()}
            </span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="col-span-2">
            <Input label="Organization name" value={form.organizationName} onChange={handleChange("organizationName")} error={fieldErrors.organizationName} placeholder="e.g. CampusTech Solutions" />
          </div>
          <div className="col-span-2">
            <Textarea label="Description" value={form.description} onChange={handleChange("description")} error={fieldErrors.description} placeholder="What does your organization do?" rows={4} />
          </div>
          <div>
            <Input label="Website" type="url" value={form.website} onChange={handleChange("website")} error={fieldErrors.website} placeholder="https://example.com" />
          </div>
          <div>
            <Input label="Phone" value={form.phone} onChange={handleChange("phone")} error={fieldErrors.phone} placeholder="e.g. 0803 000 0001" />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={loading} className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] shadow-sm">
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
        {saved && <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Profile updated.</div>}
      </Card>
    </div>
  );
}
