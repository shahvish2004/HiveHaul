# Phase 1 Schema: Source of Truth

**Purpose:** Permanent reference to prevent architectural drift.  
**Scope:** HiveHaul Phase 1 ONLY. Do NOT expand.  
**Last Updated:** 2026-05-10  
**Status:** Code complete. Awaiting schema application.

---

## Approved Table: `jobs` (ONLY TABLE IN PHASE 1)

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  service_type TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
    'New',
    'Assigned',
    'In Progress',
    'Completed',
    'Cancelled'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

---

## Approved Statuses (EXACT CAPITALIZATION)

```ts
const VALID_STATUSES = [
  'New',
  'Assigned',
  'In Progress',
  'Completed',
  'Cancelled'
]
```

**Rules:**
- ✅ Use EXACT capitalization everywhere
- ❌ NO lowercase: 'new', 'assigned', 'in_progress'
- ❌ NO underscores: 'In_Progress'
- ❌ NO abbreviations: 'IP', 'WIP'
- **Store in database AS-IS** (not normalized)
- **Frontend comparisons MUST use capitalized values**

---

## Approved Routes (ONLY 3)

```
POST   /api/jobs     → Create job with inline client fields
GET    /api/jobs     → Retrieve all jobs (flat jobs table only)
PUT    /api/jobs     → Update job status (validated to approved statuses only)
```

**POST /api/jobs body:**
```json
{
  "client_name": "string",
  "client_email": "string",
  "client_phone": "string",
  "service_type": "string",
  "pickup_address": "string",
  "dropoff_address": "string",
  "notes": "string (optional)"
}
```

**PUT /api/jobs body:**
```json
{
  "jobId": "uuid",
  "status": "New|Assigned|In Progress|Completed|Cancelled"
}
```

---

## Forbidden (NOT IN PHASE 1)

❌ **clients table** — Client data is inline on jobs  
❌ **employees table** — Not in Phase 1  
❌ **providers table** — Provider workflows are Phase 2+  
❌ **assignments table** — Dispatch workflows are Phase 2+  
❌ **invoices table** — Billing is Phase 5+  
❌ **time_logs table** — Time tracking is Phase 4+  
❌ **documents table** — File storage is Phase 3+  
❌ **clock_sessions table** — Clock-in/out is Phase 4+  
❌ **extra status values** — Only 5 allowed  
❌ **client_id foreign keys** — Clients are inline, not referenced  
❌ **title/description columns** — Use service_type and notes only  
❌ **workflow approval chains** — Not in Phase 1  
❌ **RLS policies beyond read/write** — Keep simple  

---

## Architecture Diagram (Phase 1)

```
┌─────────────────────────────────────┐
│   Client Intake Form                │
│ (client/intake/page.tsx)            │
│                                     │
│ • client_name                       │
│ • client_email                      │
│ • client_phone                      │
│ • service_type                      │
│ • pickup_address                    │
│ • dropoff_address                   │
│ • notes                             │
└──────────────┬──────────────────────┘
               │ POST
               ▼
       ┌───────────────┐
       │  /api/jobs    │
       │  (POST, GET,  │
       │   PUT only)   │
       └───────┬───────┘
               │ INSERT/UPDATE
               ▼
    ┌──────────────────────┐
    │ Supabase             │
    │ jobs table (flat)    │
    │                      │
    │ No clients table     │
    │ No extra tables      │
    └──────────┬───────────┘
               │ SELECT
               ▼
   ┌────────────────────────┐
   │  Manager Dashboard     │
   │  (manager/jobs/page)   │
   │                        │
   │ • List all jobs        │
   │ • Display status       │
   │ • Update status        │
   │ • Search/filter        │
   └────────────────────────┘
```

---

## Development Rules

### 1. Status Handling (CRITICAL)

**Everywhere you check status, use capitalized values:**

```ts
// ✅ CORRECT
if (job.status === 'New') { ... }
if (VALID_STATUSES.includes(status)) { ... }
const allowedStatuses = ['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled']

// ❌ WRONG
if (job.status === 'new') { ... }
if (job.status === 'in_progress') { ... }
const statuses = ['new', 'assigned', 'in_progress']
```

### 2. Field Names (EXACT MATCH SCHEMA)

```ts
// ✅ CORRECT
{
  client_name,
  client_email,
  client_phone,
  pickup_address,
  dropoff_address,
  service_type,
  notes,
  status,
  job_number
}

// ❌ WRONG
{
  name,              // Should be client_name
  email,             // Should be client_email
  phone,             // Should be client_phone
  address,           // Should be pickup_address + dropoff_address
  title,             // Not in Phase 1
  description,       // Use notes instead
  client_id          // No clients table
}
```

### 3. Job Number Format (DATABASE GENERATED)

```ts
// ✅ CORRECT - Database generates via trigger
// HH-YYYY-MMDD-### (e.g., HH-2026-0510-001)
// Uses advisory locks for concurrency safety
// Never manually construct job numbers

// ❌ WRONG
uuid()
Date.now()
Math.random()
"JOB-" + something
```

### 4. API Response Format

```ts
// ✅ CORRECT
GET /api/jobs
Response: { jobs: [ { id, job_number, client_name, ... } ] }

POST /api/jobs
Response: { id, job_number, client_name, status: 'New', ... }

PUT /api/jobs
Response: { id, job_number, status: 'Assigned', ... }

// ❌ WRONG
{ data: [ ... ] }
[ ... ]  (raw array)
{ job: { ... } }
```

---

## Verification Checklist (Before Each Deploy)

- [ ] Schema applied to Supabase
- [ ] `SELECT * FROM public.jobs` returns no errors
- [ ] All status values use exact capitalization
- [ ] No lowercase comparisons (grep for 'new', 'assigned', etc.)
- [ ] API routes support POST, GET, PUT only
- [ ] PUT validates status against VALID_STATUSES
- [ ] Intake form has pickup_address AND dropoff_address (not single "address")
- [ ] Manager dashboard reads flat jobs table (no client joins)
- [ ] Job number format verified: HH-YYYY-MMDD-###
- [ ] Database generated timestamps (created_at, updated_at auto-set)
- [ ] No extra tables created
- [ ] No title/description columns
- [ ] No client_id references
- [ ] Build passes locally
- [ ] Tests pass locally
- [ ] Vercel has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## If You're Reading This in the Future

**DO NOT:**
- Add a clients table "for flexibility"
- Extend statuses for "special cases"
- Add provider/assignment tables "for Phase 2"
- Add time tracking "while we're here"
- Normalize status values

**IF ASKED TO EXPAND:** Push back. Phase 1 is intentionally minimal. Phase 2 comes after Phase 1 ships.

---

## Critical Contacts & Links

- **Schema Source:** `supabase/migrations/20260510000000_create_phase1_jobs_table.sql`
- **Supabase Project:** `https://app.supabase.com/` (Project ID: xzgmzizwexfrxdvuxgoe)
- **GitHub Repo:** `https://github.com/shahvish2004/HiveHaul`
- **Production URL:** `https://hive-haul.vercel.app` (after deploy)

---

**This document is law. No exceptions.**
