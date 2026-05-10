-- HiveHaul V2 Phase 1 Database Schema (Refined)
-- Includes job numbering, enums, triggers, and RLS preparation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types (fresh setup)
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE job_status AS ENUM (
  'New',
  'Quoted',
  'Accepted',
  'Assigned',
  'In Progress',
  'Delivered',
  'Completed',
  'Invoiced',
  'Paid',
  'Cancelled'
);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_clients_email_lower ON clients(LOWER(email));
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Comments
COMMENT ON TABLE clients IS 'Client contact information and company details';
COMMENT ON COLUMN clients.email IS 'Primary contact email (unique, case-insensitive)';

-- ============================================================================
-- JOBS TABLE
-- ============================================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Human-readable job number (e.g., HH-2026-0509-001)
  job_number TEXT NOT NULL UNIQUE,

  -- Foreign key to client
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Core job details
  title TEXT NOT NULL,
  description TEXT,

  -- Status tracking
  status job_status NOT NULL DEFAULT 'New',

  -- Addresses
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,

  -- Progress tracking
  pickup_completed BOOLEAN DEFAULT FALSE,
  dropoff_completed BOOLEAN DEFAULT FALSE,

  -- Internal notes (visible to managers/staff only)
  internal_notes TEXT,

  -- Assignment (Phase 2+)
  assigned_provider UUID,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_jobs_job_number ON jobs(job_number);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_updated_at ON jobs(updated_at DESC);

-- Comments
COMMENT ON TABLE jobs IS 'Service jobs created by clients, managed through completion and invoicing';
COMMENT ON COLUMN jobs.job_number IS 'Human-readable job ID (HH-YYYY-MMDD-###), generated on insert';
COMMENT ON COLUMN jobs.status IS 'Lifecycle status: New → Quoted → Accepted → Assigned → In Progress → Delivered → Completed → Invoiced → Paid or Cancelled';
COMMENT ON COLUMN jobs.internal_notes IS 'Notes visible to managers and staff, not shown to clients';
COMMENT ON COLUMN jobs.assigned_provider IS 'UUID reference to assigned provider/employee (Phase 2+)';

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Sequence for job numbering (never resets)
CREATE SEQUENCE job_counter START 1 INCREMENT 1;

-- Function: Generate job number on insert (HH-2026-0509-001)
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  v_job_number TEXT;
  v_next_seq INTEGER;
BEGIN
  v_next_seq := nextval('job_counter');
  NEW.job_number := 'HH-' ||
    TO_CHAR(NEW.created_at, 'YYYY-MMDD') || '-' ||
    LPAD(v_next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Set job number before insert
CREATE TRIGGER set_job_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_job_number();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update jobs.updated_at on any change
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: Update clients.updated_at on any change
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR PHASE 1
-- ============================================================================

-- Disable RLS for Phase 1 (no authentication yet)
-- Will enable in Phase 2 when adding manager/provider logins

ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - READY FOR PHASE 2 (DO NOT ENABLE YET)
-- ============================================================================

-- Uncomment and enable in Phase 2 when adding Supabase Auth

/*
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Managers can view all jobs
CREATE POLICY "managers_view_all_jobs" ON jobs
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'manager'
  );

-- Clients can view only their own jobs
CREATE POLICY "clients_view_own_jobs" ON jobs
  FOR SELECT USING (
    client_id = (
      SELECT id FROM clients
      WHERE email = LOWER(auth.jwt() ->> 'email')
      LIMIT 1
    )
  );

-- Only managers can insert jobs
CREATE POLICY "system_insert_jobs" ON jobs
  FOR INSERT WITH CHECK (true);  -- Controlled via API

-- Only managers can update jobs
CREATE POLICY "managers_update_jobs" ON jobs
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'manager'
  );

-- Only managers can delete jobs (archive instead)
CREATE POLICY "managers_delete_jobs" ON jobs
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'manager'
  );
*/

-- ============================================================================
-- FUTURE TABLES (Not created yet - reference only)
-- ============================================================================

-- Phase 2: Job assignments and status history
-- CREATE TABLE job_assignments (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   job_id UUID NOT NULL REFERENCES jobs(id),
--   assigned_to UUID NOT NULL,  -- provider/employee id
--   assigned_at TIMESTAMP,
--   status TEXT,  -- accepted, declined, in_progress
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Phase 3: Time tracking and work logs
-- CREATE TABLE job_time_logs (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   job_id UUID NOT NULL REFERENCES jobs(id),
--   provider_id UUID NOT NULL,
--   clock_in_at TIMESTAMP NOT NULL,
--   clock_out_at TIMESTAMP,
--   duration_minutes INTEGER,
--   location_lat DECIMAL,
--   location_lon DECIMAL,
--   notes TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Phase 3: Job photos and media
-- CREATE TABLE job_photos (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   job_id UUID NOT NULL REFERENCES jobs(id),
--   storage_path TEXT NOT NULL,  -- Supabase storage path
--   photo_type TEXT,  -- intake, proof, progress
--   uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   uploaded_by UUID  -- provider_id
-- );

-- Phase 5: Invoicing
-- CREATE TABLE invoices (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   job_id UUID NOT NULL REFERENCES jobs(id),
--   invoice_number TEXT UNIQUE,
--   status TEXT DEFAULT 'Draft',  -- draft, sent, paid, overdue
--   amount_cents INTEGER,
--   hst_cents INTEGER,
--   total_cents INTEGER,
--   due_date DATE,
--   sent_at TIMESTAMP,
--   paid_at TIMESTAMP,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- ============================================================================
-- TEST DATA (Optional - remove before production)
-- ============================================================================

-- INSERT INTO clients (name, email, phone, company)
-- VALUES ('John Doe', 'john@example.com', '+1-555-0100', 'Acme Corp');
--
-- INSERT INTO jobs (client_id, title, pickup_address, dropoff_address)
-- VALUES (
--   (SELECT id FROM clients LIMIT 1),
--   'Office Relocation',
--   '123 Main St, NYC, NY',
--   '456 Oak Ave, NYC, NY'
-- );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Verify triggers exist
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Test job number generation (after inserting a job):
-- SELECT job_number, client_id, title, status, created_at FROM jobs ORDER BY created_at DESC LIMIT 1;
