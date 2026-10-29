"use client";
// ============================================================================
// SECTION: JOBS - REPORT MODAL
// ============================================================================
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api";

export function ReportModal({ open, onClose, onSubmit, loading }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }
    try {
      await onSubmit(reason.trim());
      setReason("");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err.message || "Failed to report");
      }
    }
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report job"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit report"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Textarea
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Describe the issue (min 10 characters)"
        />
        {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}
      </div>
    </Modal>
  );
}
