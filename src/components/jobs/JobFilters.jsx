"use client";
// ============================================================================
// SECTION: JOBS - FILTERS (compact bar + mobile drawer)
// ============================================================================
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search, SlidersHorizontal, X, FilterX } from "lucide-react";

// ============================================================================
// SECTION: MOBILE FILTER DRAWER
// ============================================================================
function FilterDrawer({
  open,
  onClose,
  search,
  setSearch,
  category,
  setCategory,
  location,
  setLocation,
  categories,
  locations,
  onClear,
  activeCount,
}) {
  const panelRef = useRef(null);

  // Trap focus + close on Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter jobs"
        tabIndex={-1}
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t-2 border-[var(--color-ink)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="mx-auto h-1 w-10 rounded-full bg-[var(--color-border-strong)]" />
            <span className="text-sm font-bold text-[var(--color-ink)]">
              Filter jobs
            </span>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter fields */}
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or keyword"
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 border-t border-[var(--color-border)] px-4 py-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                onClear();
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-[4px] border border-[var(--color-border-strong)] py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <FilterX size={15} />
              Clear filters
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 items-center justify-center rounded-[4px] bg-[var(--color-ink)] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-ink-2)]"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SECTION: DESKTOP INLINE FILTERS
// ============================================================================
function DesktopFilters({
  search,
  setSearch,
  category,
  setCategory,
  location,
  setLocation,
  categories,
  locations,
  onClear,
}) {
  const hasFilters = search || category || location;
  return (
    <div className="hidden flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:flex-wrap sm:items-end lg:flex">
      <div className="flex-1 min-w-[200px]">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title or keyword"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-48">
        <Select
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mb-0.5 inline-flex items-center gap-1.5 rounded-[4px] border border-[var(--color-border-strong)] px-3 py-2 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          <FilterX size={14} />
          Clear
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SECTION: MOBILE FILTER TRIGGER BAR
// ============================================================================
function MobileFilterBar({
  search,
  setSearch,
  onOpenDrawer,
  activeCount,
}) {
  return (
    <div className="flex items-center gap-2 lg:hidden">
      {/* Inline search */}
      <label className="flex flex-1 items-center gap-2 rounded-[4px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2.5">
        <Search size={15} className="shrink-0 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs…"
          className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-subtle)] focus:outline-none"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch("")}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <X size={14} />
          </button>
        )}
      </label>

      {/* Filter button */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open filters"
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          activeCount > 0
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
            : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
        }`}
      >
        <SlidersHorizontal size={16} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// SECTION: EXPORTED COMPONENT
// ============================================================================
export function JobFilters({
  search,
  setSearch,
  category,
  setCategory,
  location,
  setLocation,
  categories = [],
  locations = [],
  onClear,
  drawerOpen,
  onOpenDrawer,
  onCloseDrawer,
}) {
  const activeCount = [category, location].filter(Boolean).length;

  return (
    <>
      {/* Mobile: compact bar */}
      <MobileFilterBar
        search={search}
        setSearch={setSearch}
        onOpenDrawer={onOpenDrawer}
        activeCount={activeCount}
      />

      {/* Mobile: slide-up drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={onCloseDrawer}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        location={location}
        setLocation={setLocation}
        categories={categories}
        locations={locations}
        onClear={onClear}
        activeCount={activeCount}
      />

      {/* Desktop: inline filters */}
      <DesktopFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        location={location}
        setLocation={setLocation}
        categories={categories}
        locations={locations}
        onClear={onClear}
      />
    </>
  );
}
