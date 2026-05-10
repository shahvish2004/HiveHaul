// Database types for HiveHaul V2

export type JobStatus =
  | 'New'
  | 'Quoted'
  | 'Accepted'
  | 'Assigned'
  | 'In Progress'
  | 'Delivered'
  | 'Completed'
  | 'Invoiced'
  | 'Paid'
  | 'Cancelled';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  status: JobStatus;
  pickup_address?: string;
  dropoff_address?: string;
  pickup_completed?: boolean;
  dropoff_completed?: boolean;
  internal_notes?: string;
  assigned_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface JobWithClient extends Job {
  client: Client;
}

export interface CreateJobInput {
  client_name: string;
  client_email: string;
  client_phone?: string;
  title: string;
  description?: string;
  pickup_address?: string;
  dropoff_address?: string;
}
