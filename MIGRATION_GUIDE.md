# HiveHaul Phase 1.5 Migration Guide

**Current Status**: ✅ Code implementation complete | ❌ Database migration NOT applied

## Problem

The database constraint `jobs_status_check` only allows 5 old statuses:
- New, Assigned, In Progress, Completed, Cancelled

The Phase 1.5 workflow requires 10 statuses:
- New, Under Review, Approved, Deposit Requested, Deposit Received, Scheduled, In Progress, Completed, Cancelled, Declined

**Error when attempting new statuses**:
```
new row for relation "jobs" violates check constraint "jobs_status_check"
```

## Why Automated Migration Failed

All programmatic approaches were attempted and failed:
- ❌ pg package: Forbidden by user requirement
- ❌ psql: Not installed on system
- ❌ Supabase CLI: Cannot authenticate
- ❌ Supabase Dashboard: Web access denied (security permissions)
- ❌ REST API: Doesn't support raw SQL execution
- ❌ RPC Functions: Not configured in Supabase

## Solution: Manual Application via Supabase Dashboard

### Step-by-Step Instructions

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Sign in with your account

2. **Select Project**
   - Click "Projects"
   - Find and select: **xzgmzizwexfrxdvuxgoe**
   - Click to open

3. **Navigate to SQL Editor**
   - Left sidebar: Click **"SQL Editor"**
   - Alternatively: Click "Database" → "SQL Editor"

4. **Create New Query**
   - Click **"+ New Query"** button
   - A new SQL editor tab will open

5. **Copy Migration SQL**
   - Copy the entire SQL below:
   ```sql
   ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
   
   ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
   CHECK (
     status IN (
       'New',
       'Under Review',
       'Approved',
       'Deposit Requested',
       'Deposit Received',
       'Scheduled',
       'In Progress',
       'Completed',
       'Cancelled',
       'Declined'
     )
   );
   ```

6. **Paste into Editor**
   - Click in the SQL editor area
   - Paste the SQL (Ctrl+V or Cmd+V)

7. **Execute Migration**
   - Click the blue **"RUN"** button (top right)
   - OR press: Ctrl+Enter (or Cmd+Enter)

8. **Verify Success**
   - You should see: **"Success. No rows returned"**
   - The left panel will confirm the constraint was updated

## After Migration is Applied

Once the migration is applied to the database, you can:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Access Manager Dashboard**:
   - Open: http://localhost:3001/manager (or 3002 if 3001 is busy)
   - All 10 status filters will be available

3. **Test the Workflow**:
   - Click on any "New" job
   - Click "Review" button → status becomes "Under Review" ✓
   - Click "Request Deposit" → shows deposit amount form ✓
   - Enter amount → status becomes "Deposit Requested" ✓
   - Click "Mark Deposit Received" → "Deposit Received" ✓
   - Click "Schedule" → status becomes "Scheduled" ✓
   - And so on through the workflow...

4. **Customer Status Page**:
   - Go to: http://localhost:3001/request/status
   - Enter job number and email
   - Verify status displays correctly with human-friendly message

## Proof Job for Testing

Use existing job: **HH-2026-0517-010**
- Client: Test Loading Dock
- Current Status: New
- Good test case: Standard commercial loading dock scenario

## Files Ready for Workflow

Once migration is applied, these features are fully functional:

### Manager Dashboard (`/manager`)
- ✅ Job list with status filters
- ✅ Context-specific action buttons per status
- ✅ Decline workflow with 7 reasons + custom text
- ✅ Deposit workflow with amount and instructions
- ✅ Notes modal for manager notes
- ✅ Real-time status updates
- ✅ All 10 statuses with custom colors

### Customer Status Page (`/request/status`)
- ✅ Email-gated status lookup
- ✅ Human-friendly status messages
- ✅ No internal details exposed

### API Routes
- ✅ `/api/manager/jobs` - PUT endpoint for all manager actions
- ✅ `/api/request/status` - POST endpoint for customer status lookup
- ✅ `/api/jobs` - GET endpoint for manager dashboard

## Troubleshooting

**If migration fails with "already exists" error:**
- The new constraint might already be partially applied
- Run the same SQL again (it uses `IF EXISTS` so it's safe)

**If you see "permission denied":**
- Ensure you're signed into Supabase with the correct account
- Verify you have owner/admin access to the project

**If jobs still can't update after migration:**
- Refresh the dev server: Ctrl+C and `npm run dev`
- Check the dev logs: `tail -50 dev.log`
- The error message will show what constraint is still blocking

## Timeline

- Migration creation: Complete ✅
- Code implementation: Complete ✅
- Database migration: **PENDING - REQUIRES MANUAL APPLICATION**
- Testing: Ready to begin once migration is applied
- Deployment: Ready for production once tested

## Contact

If you need help with:
- The migration SQL: Check `supabase/migrations/20260518110000_expand_job_statuses.sql`
- The implementation: Review `app/api/manager/jobs/route.ts`
- Testing: Use the proof job HH-2026-0517-010
