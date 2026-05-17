'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const jobNumber = searchParams.get('jobNumber')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="text-6xl">✅</div>

          {/* Success Message */}
          <div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Request Submitted
            </h1>
            <p className="text-slate-600">
              Your request has been received. HiveHaul will review the details and contact you with pricing, availability, and next steps. Booking is not confirmed until approved by HiveHaul and any required deposit is received.
            </p>
          </div>

          {/* Job Number Display */}
          {jobNumber && (
            <div className="bg-slate-100 rounded-lg p-6">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Job Number</p>
              <p className="text-3xl font-bold text-slate-900 font-mono break-all">
                {jobNumber}
              </p>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-3">What happens next?</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Our team will review your request</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>We'll contact you within 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>We'll provide an estimate and timeline</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>You'll receive updates via email</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Link
            href="/client/intake"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Submit Another Request
          </Link>

          {/* Footer */}
          <p className="text-xs text-slate-500">
            Save your job number for reference. You can check the status using this number anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
