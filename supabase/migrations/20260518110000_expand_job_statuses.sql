-- Expand job statuses to support Phase 1.5 booking workflow
-- Migration: Expand job_status_check constraint

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
