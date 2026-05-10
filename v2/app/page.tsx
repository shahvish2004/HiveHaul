'use client'

import { useState } from 'react'
import ClientIntakeForm from '@/components/ClientIntakeForm'

export default function Home() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            HiveHaul™
          </h1>
          <p className="text-slate-600">Service Agreement & Job Intake Form</p>
        </div>

        {/* Main Content */}
        {!submitted ? (
          <ClientIntakeForm onSuccess={() => setSubmitted(true)} />
        ) : (
          <div className="card bg-green-50 border border-green-200">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              ✓ Job Submitted Successfully
            </h2>
            <p className="text-green-700 mb-4">
              Your service request has been received and assigned a job ID. Our team will review it shortly and contact you to confirm details and provide a quote.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn btn-primary"
            >
              Submit Another Job
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
