-- HiveHaul V2 Phase 1 Database Schema
-- Run these migrations in Supabase to set up clients and jobs tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Clients table
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

-- Create unique index on email to prevent duplicate client creation
CREATE UNIQUE INDEX idx_clients_email ON clients(LOWER(email));
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
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
  )),
  pickup_address TEXT,
  dropoff_address TEXT,
  pickup_completed BOOLEAN DEFAULT FALSE,
  dropoff_completed BOOLEAN DEFAULT FALSE,
  internal_notes TEXT,
  assigned_provider UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_updated_at ON jobs(updated_at DESC);

-- Add comment to tables for documentation
COMMENT ON TABLE clients IS 'Client contact information and company details';
COMMENT ON TABLE jobs IS 'Service jobs created by clients, tracked through completion and invoicing';

COMMENT ON COLUMN jobs.status IS 'Job lifecycle status: New → Quoted → Accepted → Assigned → In Progress → Delivered → Completed → Invoiced → Paid';
COMMENT ON COLUMN jobs.internal_notes IS 'Notes visible only to managers and staff, not to clients';
COMMENT ON COLUMN jobs.assigned_provider IS 'UUID of assigned provider/employee (Phase 3)';

-- Future tables (Phase 2+, not created yet)
-- job_assignments (Phase 2)
-- job_time_logs (Phase 4)
-- job_photos (Phase 3+)
-- invoices (Phase 5)
-- invoice_items (Phase 5)
