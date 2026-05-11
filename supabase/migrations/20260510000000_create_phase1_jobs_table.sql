-- HiveHaul™ Phase 1 Database Schema (Production)
-- Concurrency-safe job number generation using database advisory locks
-- Single jobs table with auto-generated HH-YYYY-MMDD-### job numbers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects
DROP TRIGGER IF EXISTS set_job_number ON jobs;
DROP TRIGGER IF EXISTS set_updated_at ON jobs;
DROP TRIGGER IF EXISTS set_completed_at ON jobs;
DROP FUNCTION IF EXISTS generate_job_number();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS update_completed_at();
DROP FUNCTION IF EXISTS set_job_number_trigger();
DROP TABLE IF EXISTS jobs CASCADE;

-- ============================================================================
-- SINGLE JOBS TABLE - Phase 1 scope only
-- ============================================================================

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

-- ============================================================================
-- INDEXES FOR COMMON QUERIES
-- ============================================================================

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_number ON jobs(job_number);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_client_email ON jobs(client_email);
CREATE INDEX idx_jobs_updated_at ON jobs(updated_at DESC);

-- ============================================================================
-- FUNCTION 1: Generate HH-YYYY-MMDD-### with advisory lock
-- ============================================================================
-- Concurrency-safe: Uses pg_advisory_xact_lock to ensure only one
-- job number is generated at a time for each day.
--
-- How it works:
--   1. Create a deterministic lock key from today's date (via MD5 hash)
--   2. Acquire advisory lock (blocks until available, releases at tx end)
--   3. Now safely count existing jobs for today (no race condition)
--   4. Generate next number: HH-YYYY-MMDD-###
--
-- Result: Multiple concurrent inserts on same day serialize through
-- the lock, but don't block inserts on different days.

CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  v_date_part TEXT;
  v_next_num INT;
  v_job_number TEXT;
  v_lock_key BIGINT;
BEGIN
  -- Get today's date in YYYY-MMDD format (UTC)
  v_date_part := TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MMDD');

  -- Create deterministic lock key from date
  -- This ensures all job numbers for the same day use the same lock
  -- Different days = different locks (no cross-day blocking)
  v_lock_key := hashtext('hivehaul_job_' || v_date_part)::BIGINT;

  -- Acquire advisory lock (transaction-scoped, auto-releases at tx end)
  -- This blocks until the lock is available
  -- Only one transaction at a time can proceed past this point for each date
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Now we can safely count existing jobs for today
  -- No race condition: lock ensures serialized access
  v_next_num := (
    SELECT COUNT(*) + 1
    FROM jobs
    WHERE job_number LIKE 'HH-' || v_date_part || '-%'
  );

  -- Build job number: HH-YYYY-MMDD-###
  v_job_number := 'HH-' || v_date_part || '-' || LPAD(v_next_num::TEXT, 3, '0');

  RETURN v_job_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 2: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 3: Auto-set completed_at when status becomes Completed
-- ============================================================================

CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
    NEW.completed_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
  ELSIF NEW.status != 'Completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION 4: Trigger function to set job_number
-- ============================================================================

CREATE OR REPLACE FUNCTION set_job_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER 1: Auto-generate job_number on insert (advisory lock protected)
-- ============================================================================
-- Calls generate_job_number() which uses advisory lock for safety

CREATE TRIGGER set_job_number
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION set_job_number_trigger();

-- ============================================================================
-- TRIGGER 2: Update updated_at on INSERT and UPDATE
-- ============================================================================

CREATE TRIGGER set_updated_at
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TRIGGER 3: Auto-set completed_at when status = 'Completed'
-- ============================================================================

CREATE TRIGGER set_completed_at
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_completed_at();

-- ============================================================================
-- TABLE DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE jobs IS 'Phase 1 Core: Client intake jobs with status tracking. Lightweight foundation for intake → dispatch → completion workflow. No providers, assignments, invoices, or time tracking in Phase 1.';

COMMENT ON COLUMN jobs.id IS 'Unique job identifier (UUID)';
COMMENT ON COLUMN jobs.job_number IS 'Auto-generated format: HH-YYYY-MMDD-### (e.g., HH-2026-0509-001). Generated safely at database level with advisory locks to handle concurrent submissions.';
COMMENT ON COLUMN jobs.client_name IS 'Client full name from intake form';
COMMENT ON COLUMN jobs.client_email IS 'Client email for notifications and lookups';
COMMENT ON COLUMN jobs.client_phone IS 'Client phone number';
COMMENT ON COLUMN jobs.pickup_address IS 'Where service starts (origin address)';
COMMENT ON COLUMN jobs.dropoff_address IS 'Where service ends (destination address)';
COMMENT ON COLUMN jobs.service_type IS 'Type of service requested (Moving, Transport, Delivery, etc.)';
COMMENT ON COLUMN jobs.notes IS 'Optional notes from intake form or manager updates';
COMMENT ON COLUMN jobs.status IS 'Job lifecycle: New → Assigned → In Progress → Completed or Cancelled (5 states only, Phase 1)';
COMMENT ON COLUMN jobs.created_at IS 'When intake form was submitted (auto-set on insert)';
COMMENT ON COLUMN jobs.updated_at IS 'When job was last modified (auto-updated on any change)';
COMMENT ON COLUMN jobs.completed_at IS 'When job was marked Completed (auto-set when status changes to Completed)';

-- ============================================================================
-- CONCURRENCY SAFETY EXPLANATION
-- ============================================================================
-- Job number generation is protected by pg_advisory_xact_lock:
--
-- Scenario: Two clients submit intake forms at the exact same time
-- Without advisory lock: Both might get the same number (race condition)
-- With advisory lock: Transactions serialize on the lock
--   - Transaction 1: Acquires lock, gets HH-2026-0509-001
--   - Transaction 2: Waits for lock, then gets HH-2026-0509-002
--   - Result: No duplicates, guaranteed sequential numbering
--
-- Lock scope: Per-day basis
--   - All inserts on 2026-05-09 use the same lock
--   - Inserts on 2026-05-10 use a different lock (no blocking)
--   - Very efficient: most days have sequential inserts anyway
--
-- Lock release: Automatic at transaction end (pg_advisory_xact_lock)
--   - No manual lock management required
--   - Locks auto-release on COMMIT or ROLLBACK
--   - No risk of deadlocks or forgotten locks

-- ============================================================================
-- PHASE 1 SCOPE ONLY
-- ============================================================================
-- NOT included in Phase 1:
--   • clients table (client data is inline in jobs)
--   • providers / assignments (Phase 2+)
--   • invoices / payroll (Phase 5+)
--   • clock-in/out / time logs (Phase 4+)
--   • photos / documents (Phase 3+)
--   • extra statuses (only 5: New, Assigned, In Progress, Completed, Cancelled)
--   • compliance tables (Phase TBD)
-- ============================================================================
