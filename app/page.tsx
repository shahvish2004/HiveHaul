import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Branding */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white">HiveHaul™</h1>
          <p className="text-blue-100 text-lg">Transport & Service Operations</p>
        </div>

        {/* Main CTA */}
        <div className="space-y-4">
          <p className="text-blue-50 text-lg">
            Welcome to HiveHaul. What would you like to do?
          </p>

          {/* Client Button */}
          <Link
            href="/client/intake"
            className="block bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold py-4 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            📋 Submit a Service Request
          </Link>

          {/* Manager Button */}
          <Link
            href="/manager/jobs"
            className="block bg-blue-50 hover:bg-white text-blue-600 hover:text-blue-700 font-bold py-4 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            🎯 Manage Jobs (Manager)
          </Link>
        </div>

        {/* Footer */}
        <div className="text-blue-100 text-sm pt-8 border-t border-blue-400">
          <p>Phase 1 - Lightweight Transport Operations Platform</p>
        </div>
      </div>
    </div>
  )
}
