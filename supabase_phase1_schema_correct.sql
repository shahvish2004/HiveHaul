-- HiveHaul™ Phase 1 Database Schema (Correct)
-- Lightweight, focused on core CRUD functionality only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop jobs table if it exists (fresh setup)
DROP TABLE IF EXISTS jobs CASCADE;

-- Single jobs table with inline client info
-- Phase 1 scope: intake → dispatch → status tracking only
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

-- Indexes for common queries
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_number ON jobs(job_number);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_client_email ON jobs(client_email);

-- Document the table
COMMENT ON TABLE jobs IS 'Phase 1: Client intake jobs with status tracking. No providers/assignments/invoices yet.';
COMMENT ON COLUMN jobs.job_number IS 'Format: HH-YYYY-MMDD-### (e.g., HH-2026-0509-001)';
COMMENT ON COLUMN jobs.status IS 'Lifecycle: New → Assigned → In Progress → Completed or Cancelled';
COMMENT ON COLUMN jobs.completed_at IS 'Timestamp when job was marked Completed';
