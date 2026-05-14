// HiveHaul Phase 1 Database Types
// Phase 1 scope: Lightweight job intake with standalone jobs table
// No clients table, no providers, no invoices - just job tracking

export type JobStatus = 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Job {
  id: string;
  job_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  pickup_address: string;
  dropoff_address: string;
  service_type: string;
  notes?: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateJobInput {
  client_name: string;
  client_email: string;
  client_phone: string;
  pickup_address: string;
  dropoff_address: string;
  service_type: string;
  notes?: string;
}
