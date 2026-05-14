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
    Quoted: 'bg-purple-100 text-purple-800',
    Accepted: 'bg-cyan-100 text-cyan-800',
    Assigned: 'bg-indigo-100 text-indigo-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Delivered: 'bg-orange-100 text-orange-800',
    Completed: 'bg-green-100 text-green-800',
    Invoiced: 'bg-slate-100 text-slate-800',
    Paid: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-red-100 text-red-800',
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
            <tr
              key={job.id}
              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
