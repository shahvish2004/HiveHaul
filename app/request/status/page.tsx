'use client'

import { useState } from 'react'
import Link from 'next/link'

interface JobStatus {
  job_number: string
  status: string
  created_at: string
  client_email: string
}

const STATUS_MESSAGES: Record<string, string> = {
  New: 'Your request has been received.',
  'Under Review': 'We are reviewing your request.',
  Approved: 'Your request has been approved.',
  'Deposit Requested': 'Deposit required before scheduling.',
  'Deposit Received': 'Your deposit has been received. Scheduling your service.',
  Scheduled: 'Your booking has been scheduled.',
  'In Progress': 'Service is in progress.',
  Completed: 'Service completed.',
  Cancelled: 'Request cancelled.',
  Declined: 'Request could not be accommodated.',
}

export default function StatusPage() {
  const [jobNumber, setJobNumber] = useState('')
  const [email, setEmail] = useState('')
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setJobStatus(null)

    if (!jobNumber.trim() || !email.trim()) {
      setError('Please enter both job number and email.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/request/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobNumber: jobNumber.trim(), email: email.trim() }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Job not found. Please verify your job number and email.')
        } else {
          const data = await response.json()
          setError(data.error || 'Failed to fetch job status.')
        }
        return
      }

      const data = await response.json()
      setJobStatus(data)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container-max py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Check Your Status</h1>
          <p className="text-slate-600 text-sm">Track your HiveHaul service request</p>
        </div>
      </div>

      <div className="container-max py-8">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="card">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Number
              </label>
              <input
                type="text"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                placeholder="e.g., HH-20250518-001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:bg-slate-400 transition-colors"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {error && (
            <div className="mt-6 card bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {jobStatus && (
            <div className="mt-6 card">
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Job Number</p>
                <p className="text-lg font-mono font-semibold text-slate-800">
                  {jobStatus.job_number}
                </p>
              </div>

              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Current Status</p>
                <p className="text-lg font-semibold text-amber-600">
                  {jobStatus.status}
                </p>
              </div>

              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Submitted Date</p>
                <p className="text-sm text-slate-800">
                  {new Date(jobStatus.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  {STATUS_MESSAGES[jobStatus.status] ||
                    'Thank you for choosing HiveHaul.'}
                </p>
              </div>

              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-700">
                  For updates or questions about your request, HiveHaul may contact you using the phone number or email address provided on your service request.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/client/intake"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              ← Back to Service Request
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
