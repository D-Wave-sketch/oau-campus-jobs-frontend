"use client";
// ============================================================================
// SECTION: JOBS - FILTERS
// ============================================================================
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FilterX } from "lucide-react";

export function JobFilters({ search, setSearch, category, setCategory, location, setLocation, categories = [], locations = [], onClear }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 min-w-[200px]">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or keyword" />
      </div>
      <div className="w-full sm:w-48">
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>
      <div className="w-full sm:w-48">
        <Select label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </div>
      {(search || category || location) && (
        <Button variant="ghost" onClick={onClear} className="mb-0.5">
          <FilterX size={16} /> Clear
        </Button>
      )}
    </div>
  );
}
