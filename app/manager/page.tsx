'use client'

import { useEffect, useState } from 'react'
import type { Job } from '@/lib/types'
import JobTable from '@/components/JobTable'

export default function ManagerDashboard() {
  const [jobs, setJobs] = useState<(Job & { client: any })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('All')

  const statuses = [
    'All',
    'New',
    'Quoted',
    'Accepted',
    'Assigned',
    'In Progress',
    'Delivered',
    'Completed',
    'Invoiced',
    'Paid',
    'Cancelled',
  ]

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/jobs')
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        const data = await response.json()
        setJobs(data)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const filteredJobs =
    filter === 'All' ? jobs : jobs.filter((job) => job.status === filter)

  const statusCounts = statuses.reduce(
    (acc, status) => {
      if (status === 'All') {
        acc[status] = jobs.length
      } else {
        acc[status] = jobs.filter((job) => job.status === status).length
      }
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container-max py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Manager Dashboard
          </h1>
          <p className="text-slate-600 text-sm">View and manage all service jobs</p>
        </div>
      </div>

      <div className="container-max py-6">
        {/* Status Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded font-medium whitespace-nowrap transition-all text-sm ${
                  filter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="card bg-red-50 border border-red-200 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="card text-center py-8">
            <p className="text-slate-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-600">
              No jobs found {filter !== 'All' ? `with status "${filter}"` : ''}
            </p>
          </div>
        ) : (
          <JobTable jobs={filteredJobs} />
        )}
      </div>
    </main>
  )
}
