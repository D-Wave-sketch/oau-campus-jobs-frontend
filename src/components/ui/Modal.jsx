"use client";
// ============================================================================
// SECTION: UI MODAL
// ============================================================================
import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-[85vh] overflow-auto m-4"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h2>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose} aria-label="Close">
            <X size={14} />
          </Button>
        </div>
        <div className="px-6 pb-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-[var(--color-border)]">{footer}</div>}
      </div>
    </div>
  );
}
