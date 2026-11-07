"use client";

import React from "react";
import { clsx } from "clsx";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}) {
  const renderIcon = () => {
    if (!Icon) return null;
    // 1. If already passed as a rendered JSX element (e.g. icon={<Briefcase />})
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    // 2. If passed as a component reference (function or forwardRef object like Lucide icons)
    if (
      typeof Icon === "function" ||
      (typeof Icon === "object" && Icon !== null && "$$typeof" in Icon)
    ) {
      const IconComponent = Icon;
      return <IconComponent size={22} />;
    }
    return null;
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-muted)] mb-3 border border-[var(--color-border)]">
          {renderIcon()}
        </div>
      )}
      {title && (
        <h3 className="font-bold text-base text-[var(--color-ink)] tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-[var(--color-muted)] mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action ? (
        <div className="mt-5">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}