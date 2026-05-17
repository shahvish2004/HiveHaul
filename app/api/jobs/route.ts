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
      pickup_building_type_custom,
      dropoff_building_type_custom,
      pickup_house_access_level,
      dropoff_house_access_level,
      pickup_access,
      dropoff_access,
      pickup_access_custom,
      dropoff_access_custom,
      assistance_pickup,
      assistance_dropoff,
      pickup_floor,
      pickup_elevator_available,
      pickup_stairs,
      pickup_unit_suite,
      dropoff_floor,
      dropoff_elevator_available,
      dropoff_stairs,
      dropoff_unit_suite,
      notes,
      terms_accepted,
      confirm_item_details_accurate,
      understand_pricing_may_change,
      confirm_no_prohibited_items,
      understand_hivehaul_approval_required,
      understand_deposit_may_be_required,
      agree_to_terms_and_service,
      confirm_cargo_declared_accurately,
      understand_cargo_responsibility,
      confirm_cargo_details_truthful,
    } = body

    // Validate required fields
    const requiredFields = [
      'client_name', 'client_email', 'client_phone', 'service_type',
      'pickup_address', 'dropoff_address', 'pickup_date', 'pickup_time',
      'item_description',
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

    // Validate all waiver confirmations are checked
    const requiredCheckboxes = [
      'confirm_item_details_accurate',
      'understand_pricing_may_change',
      'confirm_no_prohibited_items',
      'understand_hivehaul_approval_required',
      'understand_deposit_may_be_required',
      'agree_to_terms_and_service',
      'confirm_cargo_declared_accurately',
      'understand_cargo_responsibility',
      'confirm_cargo_details_truthful'
    ]

    for (const checkbox of requiredCheckboxes) {
      if (!body[checkbox]) {
        return NextResponse.json(
          { error: 'You must confirm all required items' },
          { status: 400 }
        )
      }
    }

    // Store extended fields in notes since booking_details column may not exist yet
    const extended_info = {
      pickup_date,
      pickup_time,
      item_description,
      approximate_size,
      approximate_weight,
      pickup_building_type,
      pickup_building_type_custom: pickup_building_type === 'other' ? pickup_building_type_custom : undefined,
      pickup_house_access_level,
      dropoff_building_type,
      dropoff_building_type_custom: dropoff_building_type === 'other' ? dropoff_building_type_custom : undefined,
      dropoff_house_access_level,
      pickup_access,
      pickup_access_custom: pickup_access === 'other' ? pickup_access_custom : undefined,
      dropoff_access,
      dropoff_access_custom: dropoff_access === 'other' ? dropoff_access_custom : undefined,
      assistance_pickup,
      assistance_dropoff,
      pickup_floor,
      pickup_elevator_available,
      pickup_stairs,
      pickup_unit_suite: pickup_unit_suite || undefined,
      dropoff_floor,
      dropoff_elevator_available,
      dropoff_stairs,
      dropoff_unit_suite: dropoff_unit_suite || undefined,
      terms_accepted,
      confirm_item_details_accurate,
      understand_pricing_may_change,
      confirm_no_prohibited_items,
      understand_hivehaul_approval_required,
      understand_deposit_may_be_required,
      agree_to_terms_and_service,
      confirm_cargo_declared_accurately,
      understand_cargo_responsibility,
      confirm_cargo_details_truthful,
    }

    // Combine notes with extended info
    const combined_notes = notes ? `${notes}\n\nExtended Info: ${JSON.stringify(extended_info)}` : `Extended Info: ${JSON.stringify(extended_info)}`

    // Create job directly in jobs table with inline client info
    const job = await createJob({
      client_name,
      client_email,
      client_phone,
      pickup_address,
      dropoff_address,
      service_type,
      notes: combined_notes,
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
