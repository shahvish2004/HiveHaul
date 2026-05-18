import Link from 'next/link'
import type { Job } from '@/lib/types'

interface JobTableProps {
  jobs: Job[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-purple-100 text-purple-800',
    Approved: 'bg-cyan-100 text-cyan-800',
    'Deposit Requested': 'bg-indigo-100 text-indigo-800',
    'Deposit Received': 'bg-orange-100 text-orange-800',
    Scheduled: 'bg-amber-100 text-amber-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    Declined: 'bg-rose-100 text-rose-800',
  }
  return colors[status] || 'bg-slate-100 text-slate-800'
}

export default function JobTable({ jobs }: JobTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-100 border-b-2 border-slate-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-800 text-sm">
              Job ID
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-800 text-sm">
              Client
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-800 text-sm">
              Service
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-800 text-sm">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-800 text-sm">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <Link key={job.id} href={`/manager/jobs/${job.id}`}>
              <tr className="border-b border-slate-200 hover:bg-amber-50 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-mono text-slate-600">
                  {job.job_number}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {job.client_name}
                    </p>
                    <p className="text-xs text-slate-500">{job.client_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{job.service_type}</p>
                    {job.pickup_address && (
                      <p className="text-xs text-slate-500 truncate">
                        {job.pickup_address}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatDate(job.created_at)}
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  )
}
