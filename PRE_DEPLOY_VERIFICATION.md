# Pre-Deployment Verification Guide

**DO NOT SKIP ANY STEPS**  
**DO NOT DEPLOY TO PRODUCTION UNTIL ALL STEPS PASS**

---

## Step 1: Verify Vercel Environment Variables

**Before applying schema to Supabase**, verify production env vars are set in Vercel.

1. Go to: https://vercel.com/dashboard
2. Select **hive-haul** project
3. Click **Settings** → **Environment Variables**
4. Verify BOTH of these exist:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xzgmzizwexfrxdvuxgoe.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (should be the full JWT key)

**If missing:** Add them now. Do not proceed without these.

---

## Step 2: Apply Schema to Supabase

1. Go to: https://app.supabase.com/
2. Select **HiveHaul** project
3. Click **SQL Editor** → **New Query**
4. Open and copy entire contents of:
   ```
   ~/HiveHaul/supabase/migrations/20260510000000_create_phase1_jobs_table.sql
   ```
5. Paste into Supabase SQL Editor
6. Click **Run**
7. Should complete without errors

---

## Step 3: Verify Schema is Visible to PostgREST

**CRITICAL:** The schema must be visible to Supabase's PostgREST layer.

In Supabase SQL Editor, run:

```sql
select * from public.jobs limit 1;
```

**Expected result:** Empty table (0 rows) - this is correct for new schema  
**If error:** Table doesn't exist yet, re-run the full schema SQL

**If table exists but API still throws PGRST205:** Force schema cache refresh:

```sql
NOTIFY pgrst, 'reload schema';
```

Then wait 2-3 seconds and try again.

---

## Step 4: Verify Table Structure

In Supabase **Table Editor** or SQL:

```sql
select column_name, data_type from information_schema.columns 
where table_name = 'jobs' 
order by ordinal_position;
```

Verify you see:
- id (UUID)
- job_number (TEXT)
- client_name (TEXT)
- client_email (TEXT)
- client_phone (TEXT)
- pickup_address (TEXT)
- dropoff_address (TEXT)
- service_type (TEXT)
- notes (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- completed_at (TIMESTAMP)

**If any column missing:** Re-apply the full schema.

---

## Step 5: Test Local Development

```bash
cd ~/HiveHaul
npm run dev
```

Wait for: `Ready in X.XXs`

Test these endpoints:

### Test 5A: POST /api/jobs (Create Job)

Using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test Client",
    "client_email": "test@example.com",
    "client_phone": "555-1234",
    "service_type": "Local Transport",
    "pickup_address": "123 Main St, City, State",
    "dropoff_address": "456 Oak Ave, City, State",
    "notes": "Test job"
  }'
```

**Expected response:**
```json
{
  "id": "UUID",
  "job_number": "HH-2026-0510-001",
  "client_name": "Test Client",
  "status": "New",
  "created_at": "2026-05-10T...",
  ...
}
```

**Verify:**
- ✅ Response status is 201
- ✅ job_number follows HH-YYYY-MMDD-### format
- ✅ status is "New" (capitalized)
- ✅ created_at is auto-set

### Test 5B: GET /api/jobs (List Jobs)

```bash
curl http://localhost:3000/api/jobs
```

**Expected response:**
```json
{
  "jobs": [
    {
      "id": "UUID",
      "job_number": "HH-2026-0510-001",
      "client_name": "Test Client",
      "status": "New",
      ...
    }
  ]
}
```

**Verify:**
- ✅ Response is wrapped in `{ jobs: [...] }`
- ✅ Returns the job created in Test 5A
- ✅ status is "New" (capitalized)

### Test 5C: PUT /api/jobs (Update Status)

```bash
curl -X PUT http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "UUID-FROM-5A",
    "status": "Assigned"
  }'
```

**Expected response:**
```json
{
  "id": "UUID",
  "job_number": "HH-2026-0510-001",
  "status": "Assigned",
  "updated_at": "2026-05-10T...",
  ...
}
```

**Verify:**
- ✅ Status updated to "Assigned" (capitalized)
- ✅ updated_at is refreshed
- ✅ job_number unchanged

### Test 5D: Try Invalid Status (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "UUID-FROM-5A",
    "status": "invalid_status"
  }'
```

**Expected response:**
```json
{
  "error": "Invalid status. Allowed: New, Assigned, In Progress, Completed, Cancelled"
}
```

**Verify:**
- ✅ Request is rejected
- ✅ Error message lists valid statuses

---

## Step 6: Test Intake Form

Open: http://localhost:3000/client/intake

1. Fill form:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "(555) 123-4567"
   - Service Type: "Furniture Moving"
   - Pickup Address: "789 Pine Rd, City, State"
   - Dropoff Address: "321 Elm St, City, State"
   - Notes: "2-bedroom apartment"

2. Click **Submit Service Request**

3. Verify:
   - ✅ Form submits without errors
   - ✅ Redirects to confirmation page
   - ✅ Shows job_number in format HH-YYYY-MMDD-###
   - ✅ Job appears in Supabase Table Editor

---

## Step 7: Test Manager Dashboard

Open: http://localhost:3000/manager/jobs

Verify:
- ✅ Page loads
- ✅ Shows the job created in Step 6
- ✅ Status shows "New" (capitalized)
- ✅ Pickup and Dropoff addresses display correctly
- ✅ Client name and email display correctly

### Test 7A: Update Status in Dashboard

1. Click status button (e.g., "Assigned")
2. Verify:
   - ✅ Button becomes disabled during update
   - ✅ Status changes to "Assigned"
   - ✅ Change persists after page reload (F5)

### Test 7B: Filter by Status

1. Select status filter (e.g., "New")
2. Verify:
   - ✅ Job appears in filtered list
3. Change filter to different status
4. Verify:
   - ✅ Job disappears from list

### Test 7C: Search

1. Type job number in search (e.g., "HH-2026")
2. Verify:
   - ✅ Job appears in results
3. Type client name
4. Verify:
   - ✅ Job appears in results

---

## Step 8: Build Production Binary

```bash
npm run build
```

**Expected:** Build completes successfully with no errors

**If error:** Do NOT proceed. Debug locally first.

---

## Step 9: Final Checklist Before vercel deploy --prod

- [ ] Vercel env vars verified (Step 1)
- [ ] Schema applied to Supabase (Step 2)
- [ ] PostgREST schema refresh verified (Step 3)
- [ ] Table structure verified (Step 4)
- [ ] All API tests pass (Step 5A-D)
- [ ] Intake form works (Step 6)
- [ ] Manager dashboard works (Step 7A-C)
- [ ] Build passes (Step 8)
- [ ] No uncommitted changes
- [ ] Latest code pushed to main branch

---

## Step 10: Deploy to Production

Only after ALL above steps pass:

```bash
cd ~/HiveHaul
vercel deploy --prod
```

Wait for deployment to complete.

---

## Step 11: Test Production

After deployment completes:

1. Get production URL from Vercel dashboard
2. Test intake form at: `https://{production-url}/client/intake`
3. Test manager dashboard at: `https://{production-url}/manager/jobs`
4. Verify:
   - ✅ Intake form creates job
   - ✅ Job appears in manager dashboard
   - ✅ Status updates persist
   - ✅ Job numbers match format

---

## Rollback Plan (If Production Fails)

If production is broken:

1. **Don't panic.** Check logs:
   - Vercel: Dashboard → hive-haul → Deployments
   - Supabase: SQL Editor or Logs

2. **Most likely issues:**
   - Vercel env vars not set → Set them, redeploy
   - Schema not applied → Apply via Supabase console, test, redeploy
   - Status capitalization mismatch → Fix code, commit, redeploy

3. **If rollback needed:**
   ```bash
   vercel rollback
   ```

---

## Success Indicators

✅ HiveHaul Phase 1 is LIVE when:

- Job numbers are generated as HH-YYYY-MMDD-###
- Intake form → Manager dashboard flow works end-to-end
- Status updates persist
- No API errors in logs
- All 5 statuses (New, Assigned, In Progress, Completed, Cancelled) work

**Congratulations. Phase 1 is deployed.**
