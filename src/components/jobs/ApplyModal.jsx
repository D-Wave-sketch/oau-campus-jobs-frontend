"use client";
// ============================================================================
// SECTION: JOBS - APPLY MODAL
// ============================================================================
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api";

export function ApplyModal({ open, onClose, onSubmit, loading }) {
  const [cover, setCover] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (cover.length > 2000) {
      setError("Cover message is too long");
      return;
    }
    try {
      await onSubmit(cover);
      setCover("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err.message || "Failed to apply");
      }
    }
  };

  const handleClose = () => {
    setCover("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Apply to job"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} variant="apply" className="bg-[var(--color-apply)] hover:bg-[var(--color-apply-hover)] text-white shadow-sm">
            {loading ? "Submitting..." : "Submit application"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Textarea
          label="Cover message (optional)"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          rows={5}
          placeholder="Tell the employer why you&apos;re a good fit"
        />
        {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}
      </div>
    </Modal>
  );
}
