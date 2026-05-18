import { NextRequest, NextResponse } from 'next/server'
import { getJobByNumber } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobNumber, email } = body

    if (!jobNumber || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: jobNumber, email' },
        { status: 400 }
      )
    }

    const job = await getJobByNumber(jobNumber)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Verify email matches
    if (job.client_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Return only customer-facing information
    return NextResponse.json({
      job_number: job.job_number,
      status: job.status,
      created_at: job.created_at,
      client_email: job.client_email,
    })
  } catch (error) {
    console.error('Error fetching job status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch job status'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
