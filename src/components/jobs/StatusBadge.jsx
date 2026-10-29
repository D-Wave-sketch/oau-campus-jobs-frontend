"use client";
// ============================================================================
// SECTION: JOBS - STATUS BADGE
// ============================================================================
import { Badge } from "@/components/ui/Badge";

const map = {
  PENDING: { label: "Pending", variant: "warning" },
  SHORTLISTED: { label: "Shortlisted", variant: "info" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  OPEN: { label: "Open", variant: "success" },
  CLOSED: { label: "Closed", variant: "neutral" },
};

export function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  const cfg = map[s] || { label: s || "Unknown", variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
