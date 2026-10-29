"use client";
// ============================================================================
// SECTION: EMPLOYER - JOB FORM (CREATE / EDIT)
// ============================================================================
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { useFormErrors } from "@/hooks/useFormErrors";

const MAX_DESCRIPTION = 5000;
const MAX_COMPENSATION = 100;

export function JobForm({ job, onSubmit, loading, mode = "create" }) {
  const [form, setForm] = useState({
    title: job?.title || "",
    description: job?.description || "",
    category: job?.category || "",
    location: job?.location || "",
    compensation: job?.compensation || "",
    deadline: job?.deadline ? String(job.deadline).split("T")[0] : "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const { setFieldError, clearFieldError } = useFormErrors(setFieldErrors);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    clearFieldError(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const next = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      compensation: form.compensation.trim() || undefined,
      deadline: form.deadline || undefined,
    };

    // Client validation mirroring the Zod create/update schema
    let invalid = false;
    if (!next.title || next.title.length < 3 || next.title.length > 150) {
      setFieldError("title", "Title must be 3–150 characters");
      invalid = true;
    }
    if (!next.description || next.description.length < 20 || next.description.length > 5000) {
      setFieldError("description", "Description must be 20–5000 characters");
      invalid = true;
    }
    if (!next.category || next.category.length < 2 || next.category.length > 100) {
      setFieldError("category", "Category must be 2–100 characters");
      invalid = true;
    }
    if (!next.location || next.location.length < 2 || next.location.length > 150) {
      setFieldError("location", "Location must be 2–150 characters");
      invalid = true;
    }
    if (next.compensation && next.compensation.length > 100) {
      setFieldError("compensation", "Compensation must be 100 characters or less");
      invalid = true;
    }
    if (next.deadline && new Date(next.deadline).getTime() <= Date.now()) {
      setFieldError("deadline", "Deadline must be in the future");
      invalid = true;
    }
    if (invalid) return;

    try {
      await onSubmit(next);
    } catch (err) {
      setError(err.message || "Failed to save job");
      // Map field-level errors from the API
      if (err.fieldErrors) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          setFieldError(field, message);
        }
      }
    }
  };

  const isEdit = mode === "edit";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">
          {isEdit ? "Edit job" : "Create a job"}
        </h2>
      </div>
      {error && <div className="mb-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div className="col-span-2">
          <Input
            label="Job title"
            value={form.title}
            onChange={handleChange("title")}
            error={fieldErrors.title}
            placeholder="e.g. Junior Flutter Developer"
            required
          />
        </div>
        <div className="col-span-2">
          <Textarea
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            error={fieldErrors.description}
            placeholder="Describe the role, responsibilities and what you're looking for."
            rows={6}
            required
          />
          <div className="text-[10px] text-[var(--color-subtle)] mt-1">
            {form.description.length}/{MAX_DESCRIPTION} characters
          </div>
        </div>
        <div>
          <Input label="Category" value={form.category} onChange={handleChange("category")} error={fieldErrors.category} placeholder="e.g. Technology" required />
        </div>
        <div>
          <Input label="Location" value={form.location} onChange={handleChange("location")} error={fieldErrors.location} placeholder="e.g. OAU Campus, Ile-Ife" required />
        </div>
        <div>
          <Input label="Compensation (optional)" value={form.compensation} onChange={handleChange("compensation")} error={fieldErrors.compensation} placeholder="e.g. ₦40,000 monthly" />
          <div className="text-[10px] text-[var(--color-muted)] mt-1">{form.compensation.length}/{MAX_COMPENSATION} characters</div>
        </div>
        <div>
          <Input label="Application deadline (optional)" type="date" value={form.deadline} onChange={handleChange("deadline")} error={fieldErrors.deadline} />
        </div>
        <div className="col-span-2 flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] shadow-sm flex-1">
            {loading ? "Saving…" : isEdit ? "Save changes" : "Publish job"}
          </Button>
          {isEdit && (
            <Button variant="ghost">Cancel</Button>
          )}
        </div>
      </form>
    </Card>
  );
}
