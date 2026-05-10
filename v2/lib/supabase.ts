import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Convenience functions for common operations

export async function createOrGetClient(name: string, email: string, phone?: string) {
  // Try to get existing client by email
  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    return existing
  }

  // Create new client
  const { data, error } = await supabase
    .from('clients')
    .insert([{ name, email: email.toLowerCase(), phone }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createJob(data: {
  client_id: string
  title: string
  description?: string
  pickup_address?: string
  dropoff_address?: string
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
    .select('*, clients(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, clients(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateJobStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
