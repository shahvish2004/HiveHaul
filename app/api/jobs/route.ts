import { NextRequest, NextResponse } from 'next/server'
import { createOrGetClient, createJob, getJobs } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      client_name,
      client_email,
      client_phone,
      title,
      description,
      pickup_address,
      dropoff_address,
    } = body

    // Validate required fields
    if (!client_name || !client_email || !title || !pickup_address || !dropoff_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or get client
    const client = await createOrGetClient(client_name, client_email, client_phone)

    // Create job
    const job = await createJob({
      client_id: client.id,
      title,
      description: description || undefined,
      pickup_address,
      dropoff_address,
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobs = await getJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error fetching jobs:', error.message, error.stack)
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error)
      console.error('Error fetching jobs:', JSON.stringify(error, null, 2))
    } else {
      errorMessage = String(error)
      console.error('Error fetching jobs:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: errorMessage },
      { status: 500 }
    )
  }
}
