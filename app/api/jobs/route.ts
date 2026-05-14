import { NextRequest, NextResponse } from 'next/server'
import { createJob, getJobs, updateJobStatus } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      client_name,
      client_email,
      client_phone,
      service_type,
      pickup_address,
      dropoff_address,
      pickup_date,
      pickup_time,
      item_description,
      notes,
    } = body

    // Validate required fields
    if (!client_name || !client_email || !client_phone || !service_type || !pickup_address || !dropoff_address || !pickup_date || !pickup_time || !item_description) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, client_email, client_phone, service_type, pickup_address, dropoff_address, pickup_date, pickup_time, item_description' },
        { status: 400 }
      )
    }

    // Create job directly in jobs table with inline client info
    const job = await createJob({
      client_name,
      client_email,
      client_phone,
      pickup_address,
      dropoff_address,
      service_type,
      pickup_date,
      pickup_time,
      item_description,
      notes: notes || undefined,
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, status } = body

    if (!jobId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, status' },
        { status: 400 }
      )
    }

    const updatedJob = await updateJobStatus(jobId, status)
    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update job status'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
