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
      approximate_size,
      approximate_weight,
      pickup_building_type,
      dropoff_building_type,
      pickup_access,
      dropoff_access,
      assistance_pickup,
      assistance_dropoff,
      notes,
      terms_accepted,
    } = body

    // Validate required fields
    const requiredFields = [
      'client_name', 'client_email', 'client_phone', 'service_type',
      'pickup_address', 'dropoff_address', 'pickup_date', 'pickup_time',
      'item_description', 'approximate_size', 'approximate_weight',
      'pickup_building_type', 'dropoff_building_type', 'pickup_access',
      'dropoff_access', 'assistance_pickup', 'assistance_dropoff'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (!terms_accepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    // Store all extended fields in JSON (including date/time/description if columns don't exist)
    const booking_details = {
      pickup_date,
      pickup_time,
      item_description,
      approximate_size,
      approximate_weight,
      pickup_building_type,
      dropoff_building_type,
      pickup_access,
      dropoff_access,
      assistance_pickup,
      assistance_dropoff,
      terms_accepted,
    }

    // Create job directly in jobs table with inline client info
    const job = await createJob({
      client_name,
      client_email,
      client_phone,
      pickup_address,
      dropoff_address,
      service_type,
      notes: notes || undefined,
      booking_details,
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create job'
    return NextResponse.json(
      { error: errorMessage },
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
