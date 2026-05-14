import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Phase 1: Jobs table only, client info inline
// Approved statuses: New, Assigned, In Progress, Completed, Cancelled

const VALID_STATUSES = ['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled']

function validateStatus(status: string): boolean {
  return VALID_STATUSES.includes(status)
}

export async function createJob(data: {
  client_name: string
  client_email: string
  client_phone: string
  pickup_address: string
  dropoff_address: string
  service_type: string
  pickup_date?: string
  pickup_time?: string
  item_description?: string
  notes?: string
  booking_details?: Record<string, any>
}) {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert([{ ...data, status: 'New' }])
    .select()
    .single()

  if (error) throw error
  return job
}

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateJobStatus(id: string, status: string) {
  if (!validateStatus(status)) {
    throw new Error(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
