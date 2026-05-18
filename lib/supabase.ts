import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Phase 1.5: Jobs table with booking workflow
// Statuses: New → Under Review → Approved/Declined → Deposit flow → Scheduled → In Progress → Completed/Cancelled

const VALID_STATUSES = [
  'New',
  'Under Review',
  'Approved',
  'Deposit Requested',
  'Deposit Received',
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
  'Declined',
]

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
  notes?: string
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

export async function updateJobWithNotes(
  id: string,
  status: string,
  notesUpdate: Record<string, any>
) {
  if (!validateStatus(status)) {
    throw new Error(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`)
  }

  const job = await getJobById(id)
  let existingNotes = {}

  if (job.notes) {
    try {
      const notesParts = job.notes.split('\n\nExtended Info: ')
      if (notesParts.length > 1) {
        existingNotes = JSON.parse(notesParts[1])
      }
    } catch (e) {
      existingNotes = {}
    }
  }

  const updatedNotes = { ...existingNotes, ...notesUpdate }
  const combinedNotes = `Extended Info: ${JSON.stringify(updatedNotes)}`

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status,
      notes: combinedNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getJobByNumber(jobNumber: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_number', jobNumber)
    .single()

  if (error) throw error
  return data
}
