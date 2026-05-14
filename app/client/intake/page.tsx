'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  pickup_address: string
  dropoff_address: string
  notes: string
}

export default function IntakePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: '',
    pickup_address: '',
    dropoff_address: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit job')
      }

      const data = await response.json()
      // Redirect to confirmation page with job number
      router.push(`/client/confirmation?jobNumber=${encodeURIComponent(data.job_number)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-6 px-4 sm:py-8 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">
            HiveHaul™
          </h1>
          <p className="text-slate-600 text-base sm:text-lg">Quick Service Request</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold text-sm sm:text-base">Error</p>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information Section */}
            <fieldset>
              <legend className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
                Your Information
              </legend>

              <div className="space-y-4">
                <div>
                  <label htmlFor="client_name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="client_name"
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="client_email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="client_email"
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="client_phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="client_phone"
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </fieldset>

            {/* Service Details Section */}
            <fieldset>
              <legend className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
                Service Details
              </legend>

              <div className="space-y-4">
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-slate-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                  >
                    <option value="">Select a service type</option>
                    <option value="Local Transport">Local Transport</option>
                    <option value="Furniture Moving">Furniture Moving</option>
                    <option value="Equipment Transport">Equipment Transport</option>
                    <option value="Delivery Service">Delivery Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pickup_address" className="block text-sm font-medium text-slate-700 mb-2">
                    Pickup Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pickup_address"
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                    placeholder="123 Main Street, City, State"
                  />
                </div>

                <div>
                  <label htmlFor="dropoff_address" className="block text-sm font-medium text-slate-700 mb-2">
                    Dropoff Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dropoff_address"
                    type="text"
                    name="dropoff_address"
                    value={formData.dropoff_address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                    placeholder="456 Oak Avenue, City, State"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    rows={4}
                    placeholder="Any additional details about your service request..."
                  />
                </div>
              </div>
            </fieldset>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all text-base sm:text-lg touch-target-lg"
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Service Request'}
            </button>

            <p className="text-xs sm:text-sm text-slate-500 text-center">
              * Required fields. We'll contact you shortly to confirm your request.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
