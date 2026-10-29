# API Map - OAU Campus Jobs Backend

This document maps all backend endpoints based on audit of the backend source code.

**Backend base:** `https://oau-campus-jobs.onrender.com` (or `http://localhost:4000`)
**All API routes are prefixed with `/api` except `/health`**

## Enums/Allowed Values

From Prisma schema:
- **UserRole**: `STUDENT` | `EMPLOYER` | `ADMIN`
- **JobStatus**: `OPEN` | `CLOSED`
- **EmploymentType**: `FULL_TIME` | `PART_TIME` | `CONTRACT` | `TEMPORARY` | `INTERNSHIP` (in schema, not enforced in createJob validation - validation only checks string)
- **ApplicationStatus**: `PENDING` | `SHORTLISTED` | `ACCEPTED` | `REJECTED`
- **EmployerVerificationStatus**: `PENDING` | `VERIFIED` | `REJECTED`
- **ReportStatus**: `PENDING` | `REVIEWED` | `DISMISSED`

## Auth & User

### POST /api/auth/register
- **Auth:** Public
- **Allowed roles:** `STUDENT`, `EMPLOYER` (no ADMIN via API)
- **Request body (exact):**
```json
{
  "name": "string (min 2, max 100, trimmed)",
  "email": "string (valid email, max 254, lowercased by transform)",
  "password": "string (min 8, max 72)",
  "role": "STUDENT" | "EMPLOYER"
}
```
- **Success (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "STUDENT" | "EMPLOYER"
  },
  "token": "string (JWT, expires in 1d)"
}
```
- **Behavior:** If STUDENT, creates StudentProfile. If EMPLOYER, creates EmployerProfile with `verificationStatus: "PENDING"`, `organizationName` set to `name`.
- **Errors:** 409 if email exists. 400 on validation failure.

### POST /api/auth/login
- **Auth:** Public
- **Request body (exact):**
```json
{
  "email": "string (valid email, lowercased)",
  "password": "string (min 1, max 72)"
}
```
- **Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "STUDENT" | "EMPLOYER" | "ADMIN",
    "createdAt": "ISO8601 string"
  },
  "token": "string (JWT, expires in 1d)"
}
```
- **Errors:** 401 for invalid credentials.

### GET /api/users/me
- **Auth:** Required (Bearer token)
- **Allowed roles:** STUDENT, EMPLOYER (ADMIN gets 403)
- **Success (200):**
```json
{
  "data": <StudentProfile | EmployerProfile> (with nested user select)
}
```
StudentProfile shape: `{ id, userId, department?, level?, skills: string[], cvUrl?, user: { id, name, email, role }, createdAt, updatedAt }`
EmployerProfile shape: `{ id, userId, organizationName, description?, website?, phone?, verificationStatus: "PENDING"|"VERIFIED"|"REJECTED", user: { id, name, email, role }, createdAt, updatedAt }`
- **Errors:** 401 no/invalid token, 403 if ADMIN, 404 if profile missing.

### PATCH /api/users/me/student
- **Auth:** Required, role STUDENT
- **Request body (exact):**
```json
{
  "department": "string|max 100|null|optional",
  "level": "string|max 50|null|optional",
  "skills": ["string (trim, min 1, max 100)"] (max 50)|optional,
  "cvUrl": "valid url|null|optional"
}
```
**Must provide at least one field.**
- **Success (200):**
```json
{
  "message": "Student profile updated successfully",
  "data": <updated StudentProfile>
}
```

### PATCH /api/users/me/employer
- **Auth:** Required, role EMPLOYER
- **Request body (exact):**
```json
{
  "organizationName": "string (min 2, max 150)|optional",
  "description": "string (max 2000)|null|optional",
  "website": "valid url|null|optional",
  "phone": "string (max 30)|null|optional"
}
```
**Must provide at least one field.**
- **Success (200):**
```json
{
  "message": "Employer profile updated successfully",
  "data": <updated EmployerProfile>
}
```

## Jobs

### GET /api/jobs
- **Auth:** Public
- **Query params (exact):**
```json
{
  "search": "string (trim, min 1, max 150)|optional",
  "category": "string (trim, min 1, max 100)|optional",
  "location": "string (trim, min 1, max 150)|optional",
  "page": "number (int, positive, default 1)",
  "limit": "number (int, positive, max 100, default 10)"
}
```
**Note:** Only returns jobs with `status: "OPEN"`. Search does case-insensitive contains on title, description, category.
- **Success (200):**
```json
{
  "jobs": [
    {
      "id": number,
      "employerId": number,
      "title": "string",
      "description": "string",
      "category": "string",
      "location": "string",
      "employmentType": "FULL_TIME|PART_TIME|CONTRACT|TEMPORARY|INTERNSHIP",
      "compensation": "string|null",
      "deadline": "ISO8601|null",
      "status": "OPEN|CLOSED",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "employer": { "id": number, "name": "string" }
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### GET /api/jobs/:id
- **Auth:** Public
- **Success (200):** Returns full job object with employer (same shape as above)
- **Errors:** 404 if not found

### GET /api/jobs/saved
- **Auth:** Required, role STUDENT
- **Success (200):** Array of SavedJob records (see service - includes job details)
- **Errors:** 401, 403 if not student

### POST /api/jobs/:id/save
- **Auth:** Required, role STUDENT
- **Body:** None
- **Success (201/200):** SavedJob record
- **Errors:** 400 if job not open, 404 if job not found, 409 if already saved

### DELETE /api/jobs/:id/save
- **Auth:** Required, role STUDENT
- **Body:** None
- **Success (200):** `{ "message": "Job removed from saved list" }` (from service)
- **Errors:** 404 if not saved

### POST /api/jobs/:id/report
- **Auth:** Required, role STUDENT
- **Request body:** See job-report-validation (need to read)
- **Success:** Creates report

### GET /api/jobs/mine
- **Auth:** Required, role EMPLOYER
- **Success (200):** Array of employer's jobs with `_count.applications`
```json
[
  {
    "...job fields...",
    "_count": { "applications": number }
  }
]
```

### POST /api/jobs
- **Auth:** Required, role EMPLOYER
- **Request body (exact):**
```json
{
  "title": "string (min 3, max 150, trimmed)",
  "description": "string (min 20, max 5000, trimmed)",
  "category": "string (min 2, max 100, trimmed)",
  "location": "string (min 2, max 150, trimmed)",
  "compensation": "string (max 100, trimmed)|optional",
  "deadline": "ISO8601 datetime (must be in future)|optional"
}
```
**Note:** Schema doesn't require `employmentType` even though model has it with default PART_TIME. Create will use defaults.
- **Success (201):** Created job with employer included
- **Errors:** 403 if employer not verified ("Your employer account must be verified before posting jobs"), 404 if employer profile missing

### PATCH /api/jobs/:id
- **Auth:** Required, role EMPLOYER (owner only)
- **Request body:** Same fields as create but all optional (partial). Must provide at least one field. For deadline, can pass empty string `""` to clear it.
- **Success (200):** Updated job
- **Errors:** 400 if job closed ("Closed jobs cannot be edited"), 403 if not owner, 404 if not found

### PATCH /api/jobs/:id/close
- **Auth:** Required, role EMPLOYER (owner only)
- **Body:** None
- **Success (200):** Updated job with status CLOSED
- **Errors:** 400 if already closed, 403 if not owner, 404 if not found

### DELETE /api/jobs/:id
- **Auth:** Required, role EMPLOYER (owner only)
- **Body:** None
- **Success (200):** `{ "message": "Job deleted successfully" }`
- **Errors:** 403 if not owner, 404 if not found, 409 if has applications ("This job has applications. Close it instead of deleting it.")

## Applications

### POST /api/applications
- **Auth:** Required, role STUDENT
- **Request body (exact):**
```json
{
  "jobId": "number (coerced to int, positive)",
  "coverMessage": "string (trim, max 2000)|optional"
}
```
- **Success (201):** Created application with job and employer info
- **Errors:** 400 if job not open or deadline passed, 404 if job not found, 409 if already applied

### GET /api/applications/mine
- **Auth:** Required, role STUDENT
- **Success (200):** Array of applications ordered by appliedAt desc
```json
[
  {
    "id": number,
    "jobId": number,
    "coverMessage": "string|null",
    "status": "PENDING|SHORTLISTED|ACCEPTED|REJECTED",
    "appliedAt": "ISO8601",
    "updatedAt": "ISO8601",
    "job": {
      "title": "string",
      "category": "string",
      "location": "string",
      "compensation": "string|null",
      "status": "OPEN|CLOSED"
    }
  }
]
```

### GET /api/applications/job/:jobId
- **Auth:** Required, role EMPLOYER
- **Success (200):** Array of applications for job (must be owner)
```json
[
  {
    "id": number,
    "coverMessage": "string|null",
    "status": "PENDING|SHORTLISTED|ACCEPTED|REJECTED",
    "appliedAt": "ISO8601",
    "student": {
      "id": number,
      "name": "string",
      "email": "string"
    }
  }
]
```
- **Errors:** 404 if job not found or not owned

### PATCH /api/applications/:applicationId/status
- **Auth:** Required, role EMPLOYER
- **Request body (exact):**
```json
{
  "status": "SHORTLISTED" | "ACCEPTED" | "REJECTED"
}
```
**Cannot update if status is already ACCEPTED or REJECTED (400 "A finalised application cannot be updated")**
- **Success (200):** Updated application
- **Errors:** 400 if finalised, 404 if not found or not owned

## Admin

All admin routes require authentication + ADMIN role. Mounted at `/api/admin`.

### GET /api/admin/users
- **Auth:** ADMIN
- **Success (200):** `{ "data": [...] }`
```json
[
  {
    "id": number,
    "name": "string",
    "email": "string",
    "role": "STUDENT|EMPLOYER|ADMIN",
    "createdAt": "ISO8601",
    "studentProfile": {...} | null,
    "employerProfile": {...} | null
  }
]
```

### PATCH /api/admin/users/:id/role
- **Auth:** ADMIN
- **Request body (exact):**
```json
{
  "role": "STUDENT" | "EMPLOYER"  (cannot set ADMIN)
}
```
- **Success (200):** `{ "message": "User role updated successfully", "data": {...user with updatedAt...} }`
- **Errors:** 403 if trying to change own role, 404 if user not found

### GET /api/admin/employers/pending
- **Auth:** ADMIN
- **Success (200):** `{ "data": [...] }`
```json
[
  {
    "id": number, // employerProfileId
    "userId": number,
    "organizationName": "string",
    "description": "string|null",
    "website": "string|null",
    "phone": "string|null",
    "verificationStatus": "PENDING",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "user": { "id": number, "name": "string", "email": "string" }
  }
]
```
**Key point:** The ID used is **employer profile ID** (not user ID)

### PATCH /api/admin/employers/:id/verification
- **Auth:** ADMIN
- **Request body (exact):**
```json
{
  "status": "VERIFIED" | "REJECTED"
}
```
**Note:** Route uses employer profile ID `:id` (confirmed in service)
- **Success (200):** `{ "message": "Employer verification updated successfully", "data": <employerProfile with user> }`

### GET /api/admin/jobs
- **Auth:** ADMIN
- **Success (200):** `{ "data": [...] }` - all jobs (any status) with employer, counts
```json
[
  {
    "...job fields...",
    "employer": {
      "id": number,
      "name": "string",
      "employerProfile": {
        "organizationName": "string",
        "verificationStatus": "PENDING|VERIFIED|REJECTED"
      }
    },
    "_count": { "applications": number, "reports": number }
  }
]
```

### PATCH /api/admin/jobs/:id/moderation
- **Auth:** ADMIN
- **Request body (exact):**
```json
{
  "status": "OPEN" | "CLOSED"
}
```
- **Success (200):** `{ "message": "Job status updated successfully", "data": <updated job> }`

### GET /api/admin/reports
- **Auth:** ADMIN
- **Success (200):** `{ "data": [...] }`
```json
[
  {
    "id": number,
    "jobId": number,
    "reporterId": number,
    "reason": "string",
    "description": "string|null",
    "status": "PENDING|REVIEWED|DISMISSED",
    "reviewedAt": "ISO8601|null",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "job": { "id": number, "title": "string", "status": "OPEN|CLOSED" },
    "reporter": { "id": number, "name": "string", "email": "string" }
  }
]
```

### PATCH /api/admin/reports/:id/review
- **Auth:** ADMIN
- **Request body (exact):**
```json
{
  "status": "REVIEWED" | "DISMISSED"
}
```
- **Success (200):** `{ "message": "Report review updated successfully", "data": <updated report> }`
- **Errors:** 409 if already reviewed/dismissed

## Other Notes

### Authentication
- JWT in header: `Authorization: Bearer <token>`
- Token expires in 1 day
- Secret must be >= 32 chars
- On invalid/expired token: 401 with message "Invalid or expired token" or "Authentication required"
- On missing role/forbidden: 403 with specific messages

### Error Response Format
- Zod validation errors: 400 `{ "message": "Validation failed", "errors": [{ "field": "...", "message": "..." }] }`
- Prisma P2025: 404 `{ "message": "Resource not found" }`
- Prisma P2002: 409 `{ "message": "A record with this value already exists" }`
- Other errors: status from `error.statusCode` if 4xx/5xx else 500, message is error.message unless 500

### CORS
- Server uses `cors()` with default settings (allows all origins in development). Need to check if deployed version restricts origins.

### Demo Accounts (from seed)
- Password: `CampusDemo2026!`
- Admin: `admin@oaucampusjobs.test`
- Employers: `employer1@oaucampusjobs.test` through `employer5@oaucampusjobs.test` (all verified)
- Students: `student1@oaucampusjobs.test` through `student10@oaucampusjobs.test`

## GAP LIST

### Confirmed against live API (resolved / handled in frontend)
- **GET /api/users/me returns 403 for ADMIN** → Confirmed live. Frontend persists token+user from login; treats role as routing hint only. ADMIN does NOT call /api/users/me. *(Backend request: GET /api/users/me should return the ADMIN user object.)*
- **Saved jobs shape confirmed** → `GET /api/jobs/saved` returns `{ savedJobs: [{ id, studentId, jobId, job: {...} }] }`. Not swallowed by `/api/jobs/:id` (distinct route).
- **Login response shape confirmed** → `{ message, user: { id, name, email, role, createdAt }, token }`.
- **GET /api/jobs pagination confirmed** → `{ jobs: [...], pagination: { page, limit, total, totalPages } }`.
- **CORS** → `cors()` defaults allow localhost:3000 and deployed frontend origin.
- **Job create does NOT accept `employmentType`** per Zod schema → frontend omits it (model default PART_TIME applies).
- **Employer verification action uses employerProfile ID** (not user ID) → frontend uses profile.id from pending list.
- **Applications**: employer can only set SHORTLISTED/ACCEPTED/REJECTED; cannot revert finalized ones.

### Missing / backend requests (to hand back)
1. **No endpoint to update user name/email/password** - Only student/employer profile details updatable. No change-password endpoint. (Removed change-password from UI per spec.)
2. **No notification settings endpoint** - Removed from UI per spec.
3. **No dashboard statistics endpoint** - Dashboard counts computed client-side from real API data only; no invented stats.
4. **Some profile fields from prototype don't exist** - matricNo, faculty, availability, bio (student); staffOrRegId, location, industry (employer). Not collected anywhere.
5. **Admin employer verification needs org details for review** - GET /api/admin/employers/pending returns employerProfile (organizationName etc.) — usable by admins.
6. **No endpoint to view a student's full profile as an employer** - Application service returns student id/name/email only.
7. **Report reason min 10 chars** enforced server-side (Zod); frontend also enforces client-side.
8. **Deleting a job with applications fails** (409) → backend message surfaced; "Close job" offered as alternative in UI.
