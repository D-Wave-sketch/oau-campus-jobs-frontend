# AGENTS.md: OAU Campus Jobs Frontend

Read this file fully at the start of every session. It is the standing brief for this project: what we are building, how, and how the owner likes to work. When this file conflicts with your habits, this file wins. When it conflicts with `docs/api-map.md` on API facts, `docs/api-map.md` wins.

---

## 1. What this project is

**OAU Campus Jobs** connects Obafemi Awolowo University students with campus employers, with administrators moderating the platform. This repo is the **frontend only**. The backend already exists and is deployed.

| Item | Value |
|---|---|
| Backend repo | https://github.com/thefortune-tech/oau-campus-jobs (backend code in `/backend`) |
| Backend stack | Node.js, Express, TypeScript, PostgreSQL, Prisma, Zod, JWT |
| Live API (Render free tier) | `https://oau-campus-jobs.onrender.com` |
| Local API | `http://localhost:4000` |
| Frontend | Next.js (App Router), **plain JavaScript with `.jsx`**, Tailwind CSS v4, `lucide-react` icons |
| Env var | `NEXT_PUBLIC_API_BASE_URL` (keep `.env.example` in sync) |

Three roles, each with their own area: **STUDENT**, **EMPLOYER**, **ADMIN**. After login the app reads the role from the backend and routes to the matching dashboard.

The goal: a real, working product where every role sees the right screens and real data, and it looks and feels like a professional product, not a student project.

---

## 2. The owner and how to work with them

- The owner is a CS student at OAU and a frontend-focused fullstack developer. Treat them as a capable developer, not a beginner, but explain *why* when a decision matters.
- They write casually and in shorthand. Do not mirror slang or pidgin in your replies. Be clear, direct and professional.
- They have a dry sense of humour. Light is fine, but never at the cost of clarity.
- **Be honest.** If something is wrong, fragile or half-done, say so plainly. Do not oversell. Never say something works if you have not run it.
- **Describe what the UI actually renders**, not what you intended. If you cannot look at it in a browser, say "I could not verify this visually".
- Prefer **short summaries after each unit of work**: what changed, which files, how it was verified, what is still open. No walls of text, no restating the task back.
- Ask a question only when you are genuinely blocked or a choice is truly theirs. Otherwise make a sensible decision, state it in one line, and continue.
- Work in **phases** and **stop at the end of each phase** for approval (see section 9).

### Things the owner dislikes (do not do these)

- One giant single-file component with tabs instead of real routes. They called this out explicitly. **Separate pages, folders, small components.**
- MUI or any heavy component library. We use Tailwind only.
- The generic "AI-built" look: default blue on white, Inter everywhere, same-sized rounded cards, emoji, gradient blobs.
- Fake features: buttons and forms that look functional but call nothing.
- Fake data: invented stats, made-up testimonials, placeholder job lists, "verified listings this week" style claims.
- Guessing the API and hoping it works.
- Self-reported "all tests pass" with nothing to back it up.

### Things the owner likes

- Clean, responsive, professional, **seamless** UI. "World class", not "vibe coded".
- The **Indeed** two-pane pattern: search on top, a scrolling job feed on the left, a sticky full-detail preview panel on the right. On mobile the list opens a full-screen detail sheet.
- **Wellfound**-style confident typography and an audience split ("For students" / "For employers").
- **Yelp Careers**-style hero with one prominent search bar.
- Honest empty states with a next action, skeleton loaders instead of lone spinners, helpful error messages with a retry.
- Code that is easy to scan (see section 7).

---

## 3. Non-negotiable rules

1. **No hardcoded data.** Jobs, users, applications, employers, reports, counts: all from the API. Dashboard numbers may only be derived from real list data. If no real data supports a number, omit it.
2. **The backend is the source of truth** for authentication, roles, verification status and permissions. The frontend reflects it. Hiding a button is a convenience, never security.
3. **No public admin registration, ever.** Register offers Student and Employer only. Never send `role: "ADMIN"` from the client.
4. **Never guess an endpoint or a request shape.** Use `docs/api-map.md`. If something is missing, follow the Missing Endpoint Protocol (section 8). Do not mock it.
5. **Send exact payloads.** Match the Zod schemas field for field. No alias fields, no extra fields, no empty strings where the schema would reject them.
6. **Unsupported features are removed or clearly marked unavailable**, not faked. Right now that includes: change password, notification settings, dashboard statistics.
7. **Every protected request** sends `Authorization: Bearer <JWT_TOKEN>`.
8. **Every screen handles all six states:** loading, empty, validation error (field level, from the API), failed request (with retry), expired token (401), unauthorized (403).
9. **No secrets in the repo.** Use `.env.local`, keep `.env.example`.
10. **Do not install new dependencies** without saying why. Prefer what is already installed.

---

## 4. Architecture

Real routes. One `page.jsx` per route. Thin pages, logic in hooks and `lib/`.

```
src/
├── app/
│   ├── layout.jsx                  root layout, fonts, <AuthProvider>
│   ├── globals.css                 Tailwind v4 + @theme design tokens
│   ├── page.jsx                    public home (Indeed-style two-pane)
│   ├── onboarding/page.jsx
│   ├── (auth)/login/page.jsx
│   ├── (auth)/register/student/page.jsx
│   ├── (auth)/register/employer/page.jsx
│   ├── student/    layout.jsx (role guard) + jobs, jobs/[id], applications, saved, profile, settings
│   ├── employer/   layout.jsx (role guard + verification banner) + overview, jobs, jobs/new, jobs/[id]/edit, jobs/[id]/applicants, profile, settings
│   └── admin/      layout.jsx (ADMIN guard) + users, employers, jobs, reports
├── components/
│   ├── ui/         Button, Input, Textarea, Select, Badge, Card, Modal ...
│   ├── layout/     Navbar, Sidebar, BottomNav
│   ├── jobs/       JobCard, JobDetail, JobFilters, ApplyModal, ReportModal, StatusBadge
│   ├── home/       HomeJobCard, HomeJobDetail
│   ├── profile/    ProfileHeader, StudentProfileView, StudentProfileForm, SkillsInput
│   ├── settings/   SettingsSection, SettingsRow
│   └── states/     LoadingState/Skeleton, EmptyState, ErrorState, UnauthorizedState
├── lib/
│   ├── api.js              the ONLY fetch client
│   ├── endpoints.js        one function per backend endpoint
│   ├── tokenStore.js       the ONLY place that touches the JWT in storage
│   ├── redirectByRole.js
│   ├── jobFormat.js        display helpers for jobs
│   └── profileCompleteness.js
├── context/AuthContext.jsx token, user, role, profile, login, register, logout, refreshUser
docs/api-map.md             API source of truth + Gap List
```

### Central API client (`lib/api.js`)

- Base URL from `NEXT_PUBLIC_API_BASE_URL`, trailing slash stripped.
- Attaches the bearer token automatically.
- 45 second timeout (Render cold starts); on slow responses the UI shows a "server is waking up" note.
- Normalised `ApiError { status, message, fieldErrors, payload }`.
- **401:** clear the session, go to `/login?reason=expired`. **403:** show an unauthorized state, never a redirect loop. **Network failure:** its own message with retry.
- Pages and components **never call `fetch` directly**. They call functions from `lib/endpoints.js`.

### Auth

- JWT lasts 1 day, no refresh. Persist `{ token, user }` through `tokenStore`.
- `GET /api/users/me` restores STUDENT and EMPLOYER sessions. **It returns 403 for ADMIN**, so admin sessions are restored from the saved `{ token, user }` and the role is treated as a routing hint only; the first protected admin request validates it.
- Never render a role-gated layout until auth status has resolved (no flash of the wrong dashboard).
- Role guards live in each role's `layout.jsx` and redirect on mismatch.

---

## 5. Backend facts (from the audit; verify against `docs/api-map.md`)

- **Auth:** `POST /api/auth/register` takes `name, email, password, role` (STUDENT or EMPLOYER only). `POST /api/auth/login` returns `{ user, token }`.
- **Users:** `GET /api/users/me` returns `{ data: StudentProfile | EmployerProfile }` with a nested `user`. Students update via `PATCH /api/users/me/student` (**department, level, skills, cvUrl** only). Employers via `PATCH /api/users/me/employer` (**organizationName, description, website, phone** only).
- **Jobs:** `GET /api/jobs` is public, paginated, supports search/category/location. `GET /api/jobs/:id` is public. Employers create, edit, delete and close jobs, **but only if verified (403 otherwise)**. The create schema does **not** accept `employmentType`. Deleting a job with applications is blocked (offer "Close job" instead).
- **Applications:** students `POST /api/applications` (`jobId`, `coverMessage`) and `GET /api/applications/mine`. Employers `GET /api/applications/job/:jobId` and `PATCH /api/applications/:applicationId/status` (SHORTLISTED, ACCEPTED, REJECTED). Finalized applications cannot be updated.
- **Saved jobs and reports:** students use `GET/POST/DELETE /api/jobs/saved` and `/api/jobs/:id/save`. Reports: `POST /api/jobs/:id/report` with `reason` (minimum 10 characters).
- **Admin** (everything under `/api/admin`, ADMIN only): list users and change role (STUDENT or EMPLOYER only, never ADMIN); pending employers and verification via **employerProfile ID, not user ID** (`status` VERIFIED or REJECTED); job moderation (OPEN or CLOSED); report review (REVIEWED or DISMISSED).
- **Does not exist:** change password, notification settings, dashboard stats, extra profile fields (matric number, faculty, availability, bio, employer location/industry/staff ID). Do not build UI that sends or depends on these.

Employer verification flow: `Register -> PENDING -> admin VERIFIED or REJECTED`. Only VERIFIED employers can publish jobs. Always show a clear status banner in the employer area, driven by the backend value.

---

## 6. Design system

The look must feel distinctive and professional, not templated.

- **Tokens live in `globals.css`** via Tailwind v4 `@theme`. Never hardcode colours in components; use the tokens.
- **Palette:** warm off-white background (`#fdfdf8`), white surfaces, near-black ink (`#0a0a08`), warm greys, **terracotta accent** (`#9a3412`, hover `#7c2d12`), warm borders. No default blue.
- **Fonts via `next/font/google`:** Sora (headings), Outfit (body), JetBrains Mono (small eyebrow labels). Font names must match the exports exactly (underscores for spaces) or the build fails with "Unknown font".
- **Mobile first.** Most OAU students use phones. Bottom navigation on mobile, sidebar or top nav on desktop. Test at 375px and desktop width.
- **Components:** consistent buttons, inputs, badges (distinct colours per status: Pending, Shortlisted, Accepted, Rejected, Open, Closed, Verified), cards, modals.
- **Accessibility:** visible focus rings, labels on every input, keyboard-operable dialogs, sufficient contrast (4.5:1 for text; do not put `--color-subtle` text on `--color-surface-3`), `aria-live` for status messages.
- **Loading:** skeletons for lists. **Empty:** say what is missing and offer the next action. **Errors:** plain language plus a Retry button.
- **Landing/home content must be honest.** No fake testimonials or invented counts. Numbers come from the API or are omitted.
- Do not add decorative gradients, emoji or stock-photo filler.

---

## 7. Code style

- Plain JavaScript, `.jsx` for components, functional components and hooks. Mark `"use client"` only where state, effects or handlers need it.
- **Use clear section banner comments** in every non-trivial file so blocks are easy to find by scanning, not only by reading:
  ```js
  // ============================================================================
  // SECTION: FORM STATE & HANDLERS
  // ============================================================================
  ```
  Typical sections: IMPORTS, CONSTANTS, STATE, DERIVED, EFFECTS, HANDLERS, RENDER (and sub-banners inside long render trees).
- Small components, descriptive names, no file over roughly 300 lines without a reason.
- No dead code, no commented-out blocks, no leftover `console.log`.
- Forms: controlled inputs, light client validation (required, email format, URL format), **server field errors always shown under the right input**, submit disabled while pending.
- Destructive actions (close or delete job, reject employer) need a confirmation step.
- Optimistic UI (e.g. save/unsave) must roll back and show a message on failure.
- Dates formatted consistently (for example `28 Oct 2026`). Show compensation exactly as the backend stores it.

---

## 8. Missing Endpoint Protocol

When a screen needs an endpoint that does not exist, or one that does not return what the UI needs:

1. **Stop work on that feature.** Do not mock, fake or hardcode a stand-in. Do not filter a public list as a substitute for a private one.
2. Report it in exactly this format:
   - **Screen/feature:** what needs it
   - **Needed:** method and path
   - **Request shape:** params/body
   - **Response shape:** the fields the UI needs
   - **Auth/role:** who may call it
3. Add it to the **Gap List** in `docs/api-map.md`.
4. Carry on with other unblocked work.

Known gaps to keep on the Gap List: `GET /api/users/me` should work for ADMIN; employer registration collects no organisation details for admins to review; no dashboard stats endpoint; no password change; no notification settings; confirm there is an endpoint for an employer's **own** jobs before building My Listings.

---

## 9. Phases

Finish and verify each phase against the **real API** before starting the next. After each phase give a short summary and wait for approval.

| Phase | Scope | Status |
|---|---|---|
| 0 | Backend audit, `docs/api-map.md`, Gap List | Done |
| 1 | Foundation: tokens, fonts, `lib/api.js`, `lib/endpoints.js`, `AuthContext`, `ui/` and `states/` components, layouts, navigation shells | Done |
| 2 | Auth and entry: landing, onboarding, login, both registrations, role redirects, 401/403 | Done |
| 3 | Student: browse (two-pane), filters, pagination, job details, apply, My Applications, Saved Jobs, report | Done |
| UI | Design refresh to terracotta/Sora/Outfit tokens | Done |
| 4 | Employer: overview, verification banner, create/edit/close job, My Listings, employer profile | Next |
| 5 | Employer applications: applicants per job, status updates, applicant detail | |
| 6 | Admin: dashboard, employer verification | |
| 7 | Admin: user management, job moderation, reports | |
| 8 | Profiles, settings, polish: error-state audit, accessibility pass, mobile pass | |

Open design work: the home page (Indeed-style two-pane), student profile and student settings were redesigned and need to be integrated and checked. The employer profile and settings should reuse `ProfileHeader`, the section-card pattern, `SettingsSection` and `SettingsRow`.

---

## 10. Testing and definition of done

A phase is done only when:

- Every route in scope exists, loads real data and handles all six UI states.
- `npm run build` and `npm run lint` pass.
- It has been exercised against the live API with the seed accounts (credentials in `backend/prisma/seed.ts`) **and** a freshly registered account (a new employer starts PENDING).
- Cross-role access is blocked (a student cannot reach `/employer` or `/admin`, and so on) and an expired or tampered token sends the user to `/login?reason=expired`.
- It was checked at about 375px and at desktop width, and you report what you actually saw.
- No MUI, no single-file mega-component, no fake features, no hardcoded data.

Be explicit about what you could **not** verify.

---

## 11. Environment notes (Windows)

The owner develops on Windows. Native binaries (Next SWC, Tailwind oxide, lightningcss) have been fragile on this machine.

- Commands: `npm run dev`, `npm run build`, `npm run lint`. If Turbopack fails on native bindings, `npx next dev --webpack` is the fallback.
- Do **not** delete `node_modules` or the lockfile casually, and do not run installs repeatedly. Installs here can be slow and are easily interrupted.
- If you see `Cannot find module '../lightningcss.win32-x64-msvc.node'` or a `@tailwindcss/oxide` equivalent, the platform packages did not install. Install `lightningcss-win32-x64-msvc` and `@tailwindcss/oxide-win32-x64-msvc` at the same versions as their parents, then delete `.next`.
- After any Turbopack crash or "task is missing" panic, delete the `.next` folder.
- A `GET / 500` in the dev log is a symptom. Look at the first compile error above it.
- Render's free tier cold-starts, so the first API call can take 20 to 50 seconds. This is expected, not a bug.

---

## 12. Quick checklist before you report back

- [ ] Did I use only endpoints and fields that exist in `docs/api-map.md`?
- [ ] Are all six UI states handled on every new screen?
- [ ] Any hardcoded or invented data? Remove it.
- [ ] Any feature that looks real but is not wired up? Remove or mark unavailable.
- [ ] Section banner comments in every non-trivial file?
- [ ] Used design tokens, not raw colours?
- [ ] `build` and `lint` pass?
- [ ] My summary states what I verified and what I could not.