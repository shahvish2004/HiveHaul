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
  pickup_formatted_address?: string;
  pickup_street_number?: string;
  pickup_street_name?: string;
  pickup_city?: string;
  pickup_province?: string;
  pickup_postal_code?: string;
  pickup_country?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_place_id?: string;
  dropoff_formatted_address?: string;
  dropoff_street_number?: string;
  dropoff_street_name?: string;
  dropoff_city?: string;
  dropoff_province?: string;
  dropoff_postal_code?: string;
  dropoff_country?: string;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  dropoff_place_id?: string;
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
