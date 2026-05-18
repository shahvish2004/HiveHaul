# Database Migration Required for Phase 1.5

## Issue
The jobs table has a CHECK constraint that only allows the old status values:
- New, Assigned, In Progress, Completed, Cancelled

The Phase 1.5 booking workflow requires these new status values:
- New, Under Review, Approved, Deposit Requested, Deposit Received, Scheduled, In Progress, Completed, Cancelled, Declined

## Solution
Run the following SQL in the Supabase SQL Editor:

```sql
-- First, drop the existing constraint
ALTER TABLE jobs DROP CONSTRAINT jobs_status_check;

-- Then, add the new constraint with all allowed statuses
ALTER TABLE jobs 
ADD CONSTRAINT jobs_status_check 
CHECK (status IN (
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
));
```

## Steps
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands above
4. The application will then work with the new workflow

## After Migration
Once the constraint is updated, all the new manager actions will work:
- Review: New → Under Review
- Approve: Under Review → Approved  
- Decline: Under Review → Declined
- Request Deposit: Approved → Deposit Requested
- Mark Deposit Received: Deposit Requested → Deposit Received
- Schedule Job: Deposit Received → Scheduled
- Start Job: Scheduled → In Progress
- Complete Job: In Progress → Completed
- Cancel: Any status → Cancelled
