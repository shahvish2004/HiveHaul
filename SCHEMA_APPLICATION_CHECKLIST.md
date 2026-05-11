# Schema Application Checklist

**Critical Pre-Execution Review**

Do NOT execute schema without completing this checklist.

---

## Pre-Application: Backup Current State

### Step 1: Export Current Supabase Schema (Protection Checkpoint)

In Supabase console:
1. Go to **Settings** → **Database** → **Backups**
2. Look for **Manual Backups** section
3. Click **Create backup** (or note existing backup reference)
4. Document the backup timestamp/ID

**Why:** Recovery protection if schema application overwrites unintentionally.

### Step 2: Document Current Tables

In Supabase SQL Editor:
```sql
select table_name from information_schema.tables 
where table_schema = 'public' order by table_name;
```

Note the result. Current expected: (empty or legacy tables)

---

## Schema Application: Execute in Order

### Step 3: Copy Schema File

From: `~/HiveHaul/supabase/migrations/20260510000000_create_phase1_jobs_table.sql`

Verify contents include:
- ✅ `CREATE TABLE jobs`
- ✅ Status CHECK constraint with 5 values only
- ✅ Trigger functions for job_number generation
- ✅ Advisory lock for concurrency safety
- ✅ Indexes for common queries

### Step 4: Apply Schema

In Supabase SQL Editor:
1. Create **New Query**
2. Paste entire schema file
3. Click **Run**
4. Wait for completion (should be <5 seconds)
5. Verify: No errors in output

---

## Post-Application: Validation Tests

### Step 5: Verify Table Exists

```sql
select * from public.jobs limit 1;
```

**Expected:** Empty result set (0 rows returned)  
**If error:** Run `NOTIFY pgrst, 'reload schema';` and wait 3 seconds, then retry

### Step 6: Test Job Number Generation Trigger

This is CRITICAL - validates the entire Phase 1 implementation:

```sql
insert into public.jobs (
  client_name,
  client_email,
  client_phone,
  pickup_address,
  dropoff_address,
  service_type
)
values (
  'Test User',
  'test@example.com',
  '555-555-5555',
  'Waterloo',
  'Ottawa',
  'Courier'
)
returning job_number, status, created_at;
```

**Expected output (example):**
```
job_number       | status | created_at
HH-2026-0510-001 | New    | 2026-05-10T...
```

**Verify:**
- ✅ job_number format is **HH-YYYY-MMDD-###**
- ✅ status defaults to **'New'** (capitalized)
- ✅ created_at auto-set (no manual value needed)

**If job_number is NULL or wrong format:**
- Schema has trigger issue
- Do NOT proceed to frontend testing
- Contact support or re-apply schema

### Step 7: Test Status Update

```sql
update public.jobs 
set status = 'Assigned'
where job_number = 'HH-2026-0510-001'
returning id, job_number, status, updated_at;
```

**Expected:**
```
job_number       | status   | updated_at
HH-2026-0510-001 | Assigned | 2026-05-10T... (newer timestamp)
```

**Verify:**
- ✅ Status changed to 'Assigned'
- ✅ updated_at refreshed to current time
- ✅ Can update any job by job_number or id

### Step 8: Test Invalid Status Rejection

```sql
update public.jobs 
set status = 'invalid_status'
where job_number = 'HH-2026-0510-001';
```

**Expected:** Error like:
```
ERROR: new row for relation "jobs" violates check constraint "jobs_status_check"
```

**Verify:**
- ✅ Invalid status is rejected by database CHECK constraint
- ✅ Only 5 approved statuses allowed

### Step 9: Verify All Columns Exist

```sql
select column_name, data_type, is_nullable 
from information_schema.columns 
where table_name = 'jobs' 
order by ordinal_position;
```

**Expected columns:**
| Column | Type | Nullable |
|--------|------|----------|
| id | UUID | NO |
| job_number | TEXT | NO |
| client_name | TEXT | NO |
| client_email | TEXT | NO |
| client_phone | TEXT | NO |
| pickup_address | TEXT | NO |
| dropoff_address | TEXT | NO |
| service_type | TEXT | NO |
| notes | TEXT | YES |
| status | TEXT | NO |
| created_at | TIMESTAMP | NO |
| updated_at | TIMESTAMP | NO |
| completed_at | TIMESTAMP | YES |

If any column missing or wrong type: Schema application incomplete.

---

## Pre-Frontend Testing: Sanity Checks

### Step 10: Clean Up Test Data (Optional)

If you ran test inserts above, clean them up:

```sql
delete from public.jobs where client_name = 'Test User';
```

Or leave them - the frontend tests will create their own.

### Step 11: Verify PostgREST API Access

In browser console or curl:

```bash
curl https://xzgmzizwexfrxdvuxgoe.supabase.co/rest/v1/jobs \
  -H "Authorization: Bearer eyJ..." \
  -H "apikey: eyJ..."
```

Should return:
```json
[]
```

(Empty array - no data yet)

If error like 404 or PGRST205: PostgREST schema cache needs refresh:

```sql
NOTIFY pgrst, 'reload schema';
```

Wait 3 seconds and retry.

---

## Critical: Manager Dashboard Hydration Check

Before running `npm run dev`, verify no stale field assumptions:

### Step 12: Grep for Old Field Names

```bash
grep -r "job\.client\?" ~/HiveHaul/app ~/HiveHaul/components --include="*.ts" --include="*.tsx"
grep -r "job\.title" ~/HiveHaul/app ~/HiveHaul/components --include="*.ts" --include="*.tsx"
grep -r "job\.description" ~/HiveHaul/app ~/HiveHaul/components --include="*.ts" --include="*.tsx"
grep -r "clients(\*)" ~/HiveHaul/app ~/HiveHaul/components --include="*.ts" --include="*.tsx"
```

If any matches found: Those are bugs. Fix before frontend testing.

Expected: No matches.

---

## Go/No-Go Decision

### All SQL Tests Pass?
- ✅ Table exists
- ✅ Insert creates HH-YYYY-MMDD-### job_number
- ✅ Status defaults to 'New'
- ✅ Status updates persist
- ✅ Invalid status rejected
- ✅ All columns present
- ✅ PostgREST responds
- ✅ No stale field references in code

### If YES → Proceed to Local Testing

```bash
npm run dev
```

### If NO → STOP

Do NOT proceed. Debug the failing test in Supabase first.

---

## Timeline

- Schema application: 2 min
- SQL validation tests: 10 min
- Manager dashboard check: 5 min
- Go/No-go decision: <1 min

**Total pre-frontend: ~20 minutes**

---

## Success Criteria

After completing all steps:

1. ✅ jobs table exists with correct schema
2. ✅ Job number generation works (HH-YYYY-MMDD-### format)
3. ✅ Status defaults and updates correctly
4. ✅ No stale code references to old schema
5. ✅ PostgREST API responds
6. ✅ You are confident about proceeding to local testing

**You are ready for** `npm run dev` **only when all 6 are true.**

---

## Do NOT Compress These Steps

Take 20 minutes now to validate.
Save 2 hours of debugging frontend hydration issues later.

Good schema validation = clean frontend testing.
Bad schema validation = hours of "why is job.client undefined?"

Use these 20 minutes wisely.
