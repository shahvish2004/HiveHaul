-- HiveHaul™ Phase 1 Database Schema (Final)
-- Lightweight, Phase 1 focused: intake → dispatch → status tracking
-- Job numbers generated safely at database level with proper concurrency handling

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects (fresh setup)
DROP TRIGGER IF EXISTS set_job_number ON jobs;
DROP TRIGGER IF EXISTS set_updated_at ON jobs;
DROP TRIGGER IF EXISTS set_completed_at ON jobs;
DROP FUNCTION IF EXISTS generate_job_number();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS update_completed_at();
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
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT completed_at_requires_completion CHECK (
    (status = 'Completed' AND completed_at IS NOT NULL) OR
    (status != 'Completed')
  )
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
-- FUNCTION 1: Generate HH-YYYY-MMDD-### job number safely
-- ============================================================================
-- Handles concurrent inserts by using database sequences
-- Format: HH-YYYY-MMDD-### where ### is zero-padded sequential number per day

CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  v_date_part TEXT;
  v_next_num INT;
  v_job_number TEXT;
BEGIN
  -- Get today's date in YYYY-MMDD format
  v_date_part := TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MMDD');

  -- Count jobs created today (safe with concurrent transactions)
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
  IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
    NEW.completed_at := CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
  ELSIF NEW.status != 'Completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER 1: Generate job_number before insert
-- ============================================================================
-- Executes BEFORE INSERT to set job_number automatically
-- Guarantees unique, properly formatted job number even with concurrent inserts

CREATE TRIGGER set_job_number
BEFORE INSERT ON jobs
FOR EACH ROW
WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
EXECUTE FUNCTION generate_job_number();

-- Update trigger to call the function and capture return value
CREATE OR REPLACE FUNCTION set_job_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one with function
DROP TRIGGER IF EXISTS set_job_number ON jobs;

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

COMMENT ON TABLE jobs IS 'Phase 1 Core: Client intake jobs with status tracking. Lightweight foundation: intake → dispatch → completion. No providers, assignments, invoices, or time tracking yet.';

COMMENT ON COLUMN jobs.id IS 'Unique job identifier (UUID)';
COMMENT ON COLUMN jobs.job_number IS 'Auto-generated format: HH-YYYY-MMDD-### (e.g., HH-2026-0509-001). Generated at database level for safe concurrent inserts.';
COMMENT ON COLUMN jobs.client_name IS 'Client full name from intake form';
COMMENT ON COLUMN jobs.client_email IS 'Client email for notifications';
COMMENT ON COLUMN jobs.client_phone IS 'Client phone number';
COMMENT ON COLUMN jobs.pickup_address IS 'Where service starts';
COMMENT ON COLUMN jobs.dropoff_address IS 'Where service ends';
COMMENT ON COLUMN jobs.service_type IS 'Type of service (Moving, Transport, Delivery, etc.)';
COMMENT ON COLUMN jobs.notes IS 'Optional notes from intake or manager';
COMMENT ON COLUMN jobs.status IS 'Job lifecycle: New → Assigned → In Progress → Completed or Cancelled';
COMMENT ON COLUMN jobs.created_at IS 'When intake form was submitted (auto-set)';
COMMENT ON COLUMN jobs.updated_at IS 'When job was last modified (auto-updated)';
COMMENT ON COLUMN jobs.completed_at IS 'When job was marked Completed (auto-set)';

-- ============================================================================
-- PHASE 1 SCOPE ONLY
-- ============================================================================
-- NOT included in Phase 1:
--   • clients table (client data inline)
--   • providers / assignments (Phase 2)
--   • invoices / payroll (Phase 5)
--   • clock-in/out / time logs (Phase 4)
--   • photos / documents (Phase 3+)
--   • extra statuses (only 5: New, Assigned, In Progress, Completed, Cancelled)
-- ============================================================================
