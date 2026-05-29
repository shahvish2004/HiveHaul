import { NextRequest, NextResponse } from 'next/server'
import { updateJobWithNotes, getJobById } from '@/lib/supabase'
import { sendCustomerStatusNotification } from '@/lib/email'

function parseExtendedInfo(notes: string | null): Record<string, any> {
  if (!notes) return {}
  try {
    const match = notes.match(/Extended Info: ({.*})/s)
    if (match) return JSON.parse(match[1])
  } catch {
    // fall through
  }
  return {}
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, action, reason, depositAmount, depositInstructions, cancellationReason } = body

    if (!jobId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, action' },
        { status: 400 }
      )
    }

    const job = await getJobById(jobId)
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    let newStatus = job.status
    const notesUpdate: Record<string, any> = {}

    switch (action) {
      case 'review':
        newStatus = 'Under Review'
        break

      case 'approve':
        newStatus = 'Approved'
        break

      case 'decline':
        newStatus = 'Declined'
        notesUpdate.decline_reason = reason || 'Not specified'
        notesUpdate.decline_timestamp = new Date().toISOString()
        break

      case 'request_deposit':
        newStatus = 'Deposit Requested'
        notesUpdate.deposit_amount = depositAmount
        notesUpdate.deposit_instructions =
          depositInstructions ||
          'Booking requires deposit confirmation before scheduling.\n\nInterac: hivehaulca@gmail.com'
        notesUpdate.deposit_requested_timestamp = new Date().toISOString()
        break

      case 'mark_deposit_received':
        newStatus = 'Deposit Received'
        notesUpdate.deposit_received_timestamp = new Date().toISOString()
        break

      case 'schedule':
        newStatus = 'Scheduled'
        notesUpdate.scheduled_timestamp = new Date().toISOString()
        break

      case 'start':
        newStatus = 'In Progress'
        notesUpdate.started_timestamp = new Date().toISOString()
        break

      case 'complete':
        newStatus = 'Completed'
        notesUpdate.completed_timestamp = new Date().toISOString()
        break

      case 'cancel':
        newStatus = 'Cancelled'
        notesUpdate.cancelled_timestamp = new Date().toISOString()
        if (cancellationReason) {
          notesUpdate.cancellation_reason = cancellationReason
        }
        break

      case 'add_notes':
        notesUpdate.internal_notes = body.notes || ''
        notesUpdate.internal_notes_timestamp = new Date().toISOString()
        newStatus = job.status
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const updatedJob = await updateJobWithNotes(jobId, newStatus, notesUpdate)

    // Send customer notification — fire-and-forget, never blocks status update
    if (newStatus !== job.status) {
      const extInfo = { ...parseExtendedInfo(job.notes), ...notesUpdate }
      sendCustomerStatusNotification(
        { job_number: job.job_number, client_name: job.client_name, client_email: job.client_email },
        newStatus,
        extInfo
      ).catch((err) => console.error('[Email] Status notification failed:', err))
    }

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Error updating job:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update job'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
