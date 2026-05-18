'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Job } from '@/lib/types'

interface ExtendedInfo {
  [key: string]: any
  manager_flags?: string[]
}

function parseExtendedInfo(notes: string | null): ExtendedInfo | null {
  if (!notes) return null
  try {
    const match = notes.match(/Extended Info: ({.*})/s)
    if (match) {
      return JSON.parse(match[1])
    }
  } catch (e) {
    // If parsing fails, return null
  }
  return null
}

const DECLINE_REASONS = [
  'Outside service area',
  'Item not suitable',
  'Capacity unavailable',
  'Insufficient information',
  'Pricing not accepted',
  'Safety concern',
  'Other',
]

const STATUS_ACTIONS: Record<string, string[]> = {
  New: ['review', 'cancel'],
  'Under Review': ['approve', 'decline', 'request_deposit', 'cancel', 'add_notes'],
  Approved: ['request_deposit', 'cancel', 'add_notes'],
  'Deposit Requested': ['request_deposit', 'cancel', 'add_notes'],
  'Deposit Received': ['schedule', 'cancel', 'add_notes'],
  Scheduled: ['start', 'cancel', 'add_notes'],
  'In Progress': ['complete', 'cancel', 'add_notes'],
  Completed: ['add_notes'],
  Cancelled: [],
  Declined: [],
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Modal/form state
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [declineOtherText, setDeclineOtherText] = useState('')

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositInstructions, setDepositInstructions] = useState(
    'Booking requires deposit confirmation before scheduling.\n\nInterac: hivehaulca@gmail.com'
  )

  const [showNotesModal, setShowNotesModal] = useState(false)
  const [internalNotes, setInternalNotes] = useState('')

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch('/api/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const jobs = await response.json()
        const found = jobs.find((j: Job) => j.id === jobId)
        if (!found) throw new Error('Job not found')
        setJob(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  const performAction = async (action: string, payload: Record<string, any> = {}) => {
    if (!job) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/manager/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          action,
          ...payload,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update job')
      }

      const updatedJob = await response.json()
      setJob(updatedJob)
      setShowDeclineModal(false)
      setShowDepositModal(false)
      setShowNotesModal(false)
      setShowCancelModal(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-max py-8">
          <div className="card text-center py-8">
            <p className="text-slate-600">Loading job details...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-max py-8">
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-700">{error || 'Job not found'}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
          >
            Go Back
          </button>
        </div>
      </main>
    )
  }

  const availableActions = STATUS_ACTIONS[job.status as keyof typeof STATUS_ACTIONS] || []

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container-max py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Job Details</h1>
            <p className="text-slate-600 text-sm">{job.job_number}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="container-max py-8">
        {error && (
          <div className="card bg-red-50 border border-red-200 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main job info */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600">Name</p>
                  <p className="font-medium text-slate-800">{job.client_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-slate-800">{job.client_email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-slate-800">{job.client_phone}</p>
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Service Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600">Service Type</p>
                  <p className="font-medium text-slate-800">{job.service_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Pickup Address</p>
                  <p className="text-slate-800">{job.pickup_formatted_address || job.pickup_address}</p>
                  {job.pickup_city && (
                    <p className="text-xs text-slate-600 mt-1">
                      {[job.pickup_city, job.pickup_province, job.pickup_postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-600">Unloading Point</p>
                  <p className="text-slate-800">{job.dropoff_formatted_address || job.dropoff_address}</p>
                  {job.dropoff_city && (
                    <p className="text-xs text-slate-600 mt-1">
                      {[job.dropoff_city, job.dropoff_province, job.dropoff_postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-600">Submitted</p>
                  <p className="text-slate-800">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {(() => {
              const extendedInfo = parseExtendedInfo(job.notes)

              // Show cancellation reason if job is cancelled
              if (job.status === 'Cancelled' && extendedInfo?.cancellation_reason) {
                return (
                  <div className="card mb-6 bg-slate-100 border-l-4 border-slate-600">
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Cancellation Reason</h2>
                    <p className="text-slate-700">{extendedInfo.cancellation_reason}</p>
                  </div>
                )
              }

              // Show manager flags if present
              if (extendedInfo?.manager_flags && extendedInfo.manager_flags.length > 0) {
                return (
                  <div className="card mb-6 bg-amber-50 border-l-4 border-amber-500">
                    <h2 className="text-lg font-semibold text-amber-900 mb-3">Manager Flags</h2>
                    <div className="space-y-2">
                      {extendedInfo.manager_flags.map((flag: string) => (
                        <div key={flag} className="flex items-start gap-2">
                          <span className="text-amber-600 text-lg">⚠</span>
                          <p className="text-amber-800 font-medium">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {job.notes && (
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Notes & History</h2>
                <pre className="text-xs text-slate-600 whitespace-pre-wrap break-words bg-slate-50 p-3 rounded">
                  {job.notes}
                </pre>
              </div>
            )}
          </div>

          {/* Status and actions sidebar */}
          <div>
            <div className="card sticky top-6">
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Current Status</p>
                <p className="text-2xl font-bold text-amber-600">{job.status}</p>
              </div>

              <div className="space-y-2">
                {availableActions.includes('review') && (
                  <button
                    onClick={() => performAction('review')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-slate-400"
                  >
                    Review
                  </button>
                )}

                {availableActions.includes('approve') && (
                  <button
                    onClick={() => performAction('approve')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 disabled:bg-slate-400"
                  >
                    Approve
                  </button>
                )}

                {availableActions.includes('decline') && (
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:bg-slate-400"
                  >
                    Decline
                  </button>
                )}

                {availableActions.includes('request_deposit') && (
                  <button
                    onClick={() => setShowDepositModal(true)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-purple-500 text-white rounded text-sm font-medium hover:bg-purple-600 disabled:bg-slate-400"
                  >
                    Request Deposit
                  </button>
                )}

                {availableActions.includes('schedule') && (
                  <button
                    onClick={() => performAction('schedule')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-indigo-500 text-white rounded text-sm font-medium hover:bg-indigo-600 disabled:bg-slate-400"
                  >
                    Schedule Job
                  </button>
                )}

                {availableActions.includes('start') && (
                  <button
                    onClick={() => performAction('start')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-yellow-500 text-white rounded text-sm font-medium hover:bg-yellow-600 disabled:bg-slate-400"
                  >
                    Start Job
                  </button>
                )}

                {availableActions.includes('complete') && (
                  <button
                    onClick={() => performAction('complete')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-emerald-500 text-white rounded text-sm font-medium hover:bg-emerald-600 disabled:bg-slate-400"
                  >
                    Complete Job
                  </button>
                )}

                {availableActions.includes('add_notes') && (
                  <button
                    onClick={() => setShowNotesModal(true)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-slate-500 text-white rounded text-sm font-medium hover:bg-slate-600 disabled:bg-slate-400"
                  >
                    Add Notes
                  </button>
                )}

                {availableActions.includes('cancel') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 bg-slate-400 text-white rounded text-sm font-medium hover:bg-slate-500 disabled:bg-slate-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Decline Job</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Decline
                </label>
                <select
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Select a reason...</option>
                  {DECLINE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {declineReason === 'Other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={declineOtherText}
                    onChange={(e) => setDeclineOtherText(e.target.value)}
                    placeholder="Explain the reason..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason =
                      declineReason === 'Other'
                        ? `${declineReason}: ${declineOtherText}`
                        : declineReason
                    performAction('decline', { reason })
                  }}
                  disabled={!declineReason || actionLoading}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-slate-400"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Request Deposit</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deposit Amount (CAD)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g., 150"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deposit Instructions
                </label>
                <textarea
                  value={depositInstructions}
                  onChange={(e) => setDepositInstructions(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    performAction('request_deposit', {
                      depositAmount: depositAmount ? parseFloat(depositAmount) : null,
                      depositInstructions,
                    })
                  }
                  disabled={!depositAmount || actionLoading}
                  className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-slate-400"
                >
                  Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Add Internal Notes</h3>

              <div className="mb-4">
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add any notes for the team..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => performAction('add_notes', { notes: internalNotes })}
                  disabled={!internalNotes || actionLoading}
                  className="flex-1 px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 disabled:bg-slate-400"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Cancel Job</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Add any notes about why this job is being cancelled..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Keep Job
                </button>
                <button
                  onClick={() => {
                    const payload: Record<string, any> = {}
                    if (cancellationReason) {
                      payload.cancellationReason = cancellationReason
                    }
                    performAction('cancel', payload)
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-3 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 disabled:bg-slate-300"
                >
                  Cancel Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
