'use client'

import { useState } from 'react'

interface FormData {
  client_name: string
  client_email: string
  client_phone: string
  title: string
  description: string
  pickup_address: string
  dropoff_address: string
}

interface ClientIntakeFormProps {
  onSuccess?: () => void
}

export default function ClientIntakeForm({ onSuccess }: ClientIntakeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    title: '',
    description: '',
    pickup_address: '',
    dropoff_address: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      setSuccess(true)
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        title: '',
        description: '',
        pickup_address: '',
        dropoff_address: '',
      })

      if (onSuccess) {
        setTimeout(onSuccess, 500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold">New Service Request</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Client Information */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold text-slate-800 mb-4">
          Your Information
        </legend>

        <div className="form-group">
          <label htmlFor="client_name" className="form-label">
            Full Name *
          </label>
          <input
            id="client_name"
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            className="input"
            required
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="client_email" className="form-label">
            Email *
          </label>
          <input
            id="client_email"
            type="email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
            className="input"
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="client_phone" className="form-label">
            Phone Number
          </label>
          <input
            id="client_phone"
            type="tel"
            name="client_phone"
            value={formData.client_phone}
            onChange={handleChange}
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </fieldset>

      {/* Service Details */}
      <fieldset className="mb-6">
        <legend className="text-lg font-semibold text-slate-800 mb-4">
          Service Details
        </legend>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Service Title *
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            required
            placeholder="e.g., Office Relocation, Equipment Transport"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input min-h-24 resize-none"
            placeholder="Provide details about the service needed..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickup_address" className="form-label">
            Pickup Address *
          </label>
          <input
            id="pickup_address"
            type="text"
            name="pickup_address"
            value={formData.pickup_address}
            onChange={handleChange}
            className="input"
            required
            placeholder="123 Main Street, City, State"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dropoff_address" className="form-label">
            Dropoff Address *
          </label>
          <input
            id="dropoff_address"
            type="text"
            name="dropoff_address"
            value={formData.dropoff_address}
            onChange={handleChange}
            className="input"
            required
            placeholder="456 Oak Avenue, City, State"
          />
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        * Required fields. We'll review your request and contact you shortly with a quote.
      </p>
    </form>
  )
}
