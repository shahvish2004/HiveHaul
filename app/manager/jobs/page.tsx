'use client'

import { useState, useEffect } from 'react'

interface Job {
  id: string
  job_number: string
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  pickup_address: string
  dropoff_address: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

const STATUS_OPTIONS = ['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled']
const STATUS_LABELS: Record<string, string> = {
  'New': 'New',
  'Assigned': 'Assigned',
  'In Progress': 'In Progress',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'Assigned': 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
}

interface ExtendedInfo {
  pickup_date?: string
  pickup_time?: string
  item_description?: string
  approximate_size?: string
  approximate_weight?: string
  pickup_building_type?: string
  pickup_building_type_custom?: string
  dropoff_building_type?: string
  dropoff_building_type_custom?: string
  pickup_access?: string
  dropoff_access?: string
  assistance_pickup?: string
  assistance_dropoff?: string
  terms_accepted?: boolean
  [key: string]: any
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

function displayValue(key: string, value: any): string {
  if (value === undefined || value === null) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export default function ManagerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/jobs')
      if (!response.ok) throw new Error('Failed to fetch jobs')
      const data = await response.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      setUpdatingJobId(jobId)
      const response = await fetch('/api/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update job')
      const updatedJob = await response.json()

      // Update local state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, ...updatedJob } : job
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update job')
    } finally {
      setUpdatingJobId(null)
    }
  }

  // Filter jobs
  let filteredJobs = jobs
  if (filterStatus) {
    filteredJobs = filteredJobs.filter((job) => job.status === filterStatus)
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.job_number.toLowerCase().includes(term) ||
        job.client_name.toLowerCase().includes(term) ||
        job.client_email.toLowerCase().includes(term)
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            HiveHaul™ Manager
          </h1>
          <p className="text-slate-600">Job Management Dashboard</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Search by Job Number, Client Name, or Email
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Count */}
          <div className="text-sm text-slate-600">
            Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> jobs
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-slate-600">No jobs found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Job Number */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Job Number
                    </p>
                    <p className="text-lg font-bold text-slate-900 font-mono">
                      {job.job_number}
                    </p>
                  </div>

                  {/* Client Name */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Client
                    </p>
                    <p className="font-semibold text-slate-800">{job.client_name}</p>
                    <p className="text-sm text-slate-600">{job.client_email}</p>
                  </div>

                  {/* Service Type */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Service
                    </p>
                    <p className="text-slate-800">{job.service_type || 'N/A'}</p>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Created
                    </p>
                    <p className="text-slate-800">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Current Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                  </div>

                  {/* Pickup Address */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Pickup
                    </p>
                    <p className="text-slate-800 text-sm">{job.pickup_address}</p>
                  </div>

                  {/* Dropoff Address */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Dropoff
                    </p>
                    <p className="text-slate-800 text-sm">{job.dropoff_address}</p>
                  </div>
                </div>

                {/* Extended Details from Notes */}
                {(() => {
                  const extendedInfo = parseExtendedInfo(job.notes)
                  if (!extendedInfo) return null

                  return (
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-3">Service Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {extendedInfo.pickup_date && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Pickup Date</p>
                            <p className="text-slate-800">{extendedInfo.pickup_date}</p>
                          </div>
                        )}
                        {extendedInfo.pickup_time && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Pickup Time</p>
                            <p className="text-slate-800">{extendedInfo.pickup_time}</p>
                          </div>
                        )}
                        {extendedInfo.item_description && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Item Description</p>
                            <p className="text-slate-800">{extendedInfo.item_description}</p>
                          </div>
                        )}
                        {extendedInfo.approximate_size && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Size/Dimensions</p>
                            <p className="text-slate-800">{extendedInfo.approximate_size}</p>
                          </div>
                        )}
                        {extendedInfo.approximate_weight && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Weight</p>
                            <p className="text-slate-800">{extendedInfo.approximate_weight}</p>
                          </div>
                        )}
                        {extendedInfo.pickup_building_type && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Pickup Location</p>
                            <p className="text-slate-800">
                              {extendedInfo.pickup_building_type === 'other'
                                ? `Other${extendedInfo.pickup_building_type_custom ? `: ${extendedInfo.pickup_building_type_custom}` : ''}`
                                : extendedInfo.pickup_building_type}
                            </p>
                          </div>
                        )}
                        {extendedInfo.dropoff_building_type && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Dropoff Location</p>
                            <p className="text-slate-800">
                              {extendedInfo.dropoff_building_type === 'other'
                                ? `Other${extendedInfo.dropoff_building_type_custom ? `: ${extendedInfo.dropoff_building_type_custom}` : ''}`
                                : extendedInfo.dropoff_building_type}
                            </p>
                          </div>
                        )}
                        {extendedInfo.pickup_access && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Pickup Access</p>
                            <p className="text-slate-800">{extendedInfo.pickup_access}</p>
                          </div>
                        )}
                        {extendedInfo.dropoff_access && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Dropoff Access</p>
                            <p className="text-slate-800">{extendedInfo.dropoff_access}</p>
                          </div>
                        )}
                        {extendedInfo.assistance_pickup && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Pickup Assistance</p>
                            <p className="text-slate-800">{extendedInfo.assistance_pickup}</p>
                          </div>
                        )}
                        {extendedInfo.assistance_dropoff && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase mb-1">Dropoff Assistance</p>
                            <p className="text-slate-800">{extendedInfo.assistance_dropoff}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Status Update Controls */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateJobStatus(job.id, status)}
                        disabled={
                          updatingJobId === job.id || job.status === status
                        }
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          job.status === status
                            ? 'bg-slate-200 text-slate-700 cursor-default'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
