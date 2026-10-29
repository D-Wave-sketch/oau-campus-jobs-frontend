"use client";
// ============================================================================
// SECTION: IMPORTS
// ============================================================================
import { ExternalLink, Plus } from "lucide-react";
import { formatLevel } from "@/lib/profileCompleteness";

// ============================================================================
// SECTION: SMALL PIECES
// ============================================================================
function SectionCard({ title, children }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Fact({ label, value, onAdd }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--color-ink)]">
        {value ? (
          <span className="font-medium">{value}</span>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            <Plus size={14} />
            Add {label.toLowerCase()}
          </button>
        )}
      </dd>
    </div>
  );
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ============================================================================
// SECTION: STUDENT PROFILE VIEW
// Name, email and role are read-only: the backend only allows updating
// department, level, skills and cvUrl.
// ============================================================================
export function StudentProfileView({ profile, account, onEdit }) {
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const cvUrl = profile?.cvUrl?.trim?.() || "";
  const cvIsLink = /^https?:\/\//i.test(cvUrl);

  return (
    <div className="space-y-4">
      {/* Academic */}
      <SectionCard title="Academic details">
        <dl className="grid gap-5 sm:grid-cols-2">
          <Fact label="Department" value={profile?.department} onAdd={onEdit} />
          <Fact label="Level" value={formatLevel(profile?.level)} onAdd={onEdit} />
        </dl>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills">
        {skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-md bg-[var(--color-accent-glow)] px-2.5 py-1 text-sm font-medium text-[var(--color-accent)]"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline"
          >
            <Plus size={14} />
            Add your skills
          </button>
        )}
      </SectionCard>

      {/* CV */}
      <SectionCard title="CV or portfolio">
        {cvUrl ? (
          cvIsLink ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              {hostnameOf(cvUrl)}
              <ExternalLink size={14} />
            </a>
          ) : (
            <p className="break-all text-sm text-[var(--color-ink)]">{cvUrl}</p>
          )
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline"
          >
            <Plus size={14} />
            Add a link to your CV
          </button>
        )}
      </SectionCard>

      {/* Account (read-only) */}
      <SectionCard title="Account">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
              Name
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--color-ink)]">
              {account.name || "Not available"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-[var(--color-ink)]">
              {account.email || "Not available"}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--color-subtle)]">
          Your name and email can&apos;t be changed from this page.
        </p>
      </SectionCard>
    </div>
  );
}
