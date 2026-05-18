// HiveHaul Phase 1.5 Database Types
// Phase 1.5 scope: Complete booking workflow with manager actions

export type JobStatus =
  | 'New'
  | 'Under Review'
  | 'Approved'
  | 'Deposit Requested'
  | 'Deposit Received'
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Declined';

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
