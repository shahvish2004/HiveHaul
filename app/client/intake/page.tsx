'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  client_name: string
  client_email: string
  client_phone: string
  service_type: string
  pickup_address: string
  dropoff_address: string
  pickup_date: string
  pickup_time: string
  item_description: string
  approximate_size: string
  approximate_weight: string
  pickup_building_type: string
  dropoff_building_type: string
  pickup_building_type_custom?: string
  dropoff_building_type_custom?: string
  pickup_access: string
  dropoff_access: string
  pickup_access_custom?: string
  dropoff_access_custom?: string
  assistance_pickup: string
  assistance_dropoff: string
  pickup_floor?: string
  pickup_elevator_available?: string
  pickup_stairs?: string
  pickup_unit_suite?: string
  dropoff_floor?: string
  dropoff_elevator_available?: string
  dropoff_stairs?: string
  dropoff_unit_suite?: string
  notes: string
  terms_accepted: boolean
  confirm_item_details_accurate: boolean
  understand_pricing_may_change: boolean
  confirm_no_prohibited_items: boolean
  understand_hivehaul_approval_required: boolean
  understand_deposit_may_be_required: boolean
  agree_to_terms_and_service: boolean
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
    pickup_date: '',
    pickup_time: '',
    item_description: '',
    approximate_size: '',
    approximate_weight: '',
    pickup_building_type: '',
    dropoff_building_type: '',
    pickup_building_type_custom: '',
    dropoff_building_type_custom: '',
    pickup_access: '',
    dropoff_access: '',
    pickup_access_custom: '',
    dropoff_access_custom: '',
    assistance_pickup: '',
    assistance_dropoff: '',
    pickup_floor: '',
    pickup_elevator_available: '',
    pickup_stairs: '',
    pickup_unit_suite: '',
    dropoff_floor: '',
    dropoff_elevator_available: '',
    dropoff_stairs: '',
    dropoff_unit_suite: '',
    notes: '',
    terms_accepted: false,
    confirm_item_details_accurate: false,
    understand_pricing_may_change: false,
    confirm_no_prohibited_items: false,
    understand_hivehaul_approval_required: false,
    understand_deposit_may_be_required: false,
    agree_to_terms_and_service: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
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
          <Link href="/" className="inline-block mx-auto">
            <img
              src="/hivehaul-logo.png"
              alt="HiveHaul"
              className="max-w-xs sm:max-w-sm md:max-w-lg object-contain hover:opacity-90 transition-opacity mb-2"
              style={{
                maxWidth: 'min(85vw, 280px)',
              }}
            />
          </Link>
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
                    <option value="Waste Disposal / Junk Removal">Waste Disposal / Junk Removal</option>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickup_date" className="block text-sm font-medium text-slate-700 mb-2">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickup_date"
                      type="date"
                      name="pickup_date"
                      value={formData.pickup_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pickup_time" className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pickup_time"
                      type="time"
                      name="pickup_time"
                      value={formData.pickup_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="item_description" className="block text-sm font-medium text-slate-700 mb-2">
                    What are you transporting? <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="item_description"
                    type="text"
                    name="item_description"
                    value={formData.item_description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                    placeholder="e.g., Office furniture, equipment, boxes, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="approximate_size" className="block text-sm font-medium text-slate-700 mb-2">
                      Approximate Size/Dimensions <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="approximate_size"
                      type="text"
                      name="approximate_size"
                      value={formData.approximate_size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                      placeholder="e.g., 6ft x 3ft x 2ft or 5 boxes"
                    />
                  </div>
                  <div>
                    <label htmlFor="approximate_weight" className="block text-sm font-medium text-slate-700 mb-2">
                      Approximate Weight <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="approximate_weight"
                      type="text"
                      name="approximate_weight"
                      value={formData.approximate_weight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                      placeholder="e.g., 200 lbs or moderate"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Location Details Section */}
            <fieldset>
              <legend className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
                Location & Access Details
              </legend>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickup_building_type" className="block text-sm font-medium text-slate-700 mb-2">
                      Pickup Location Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickup_building_type"
                      name="pickup_building_type"
                      value={formData.pickup_building_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="house">House</option>
                      <option value="condo/apartment">Condo/Apartment</option>
                      <option value="retail/store">Retail/Store</option>
                      <option value="commercial">Commercial</option>
                      <option value="storage unit">Storage Unit</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.pickup_building_type === 'other' && (
                      <input
                        type="text"
                        name="pickup_building_type_custom"
                        value={formData.pickup_building_type_custom || ''}
                        onChange={handleChange}
                        placeholder="Please describe pickup location type"
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="dropoff_building_type" className="block text-sm font-medium text-slate-700 mb-2">
                      Dropoff Location Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="dropoff_building_type"
                      name="dropoff_building_type"
                      value={formData.dropoff_building_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="house">House</option>
                      <option value="condo/apartment">Condo/Apartment</option>
                      <option value="retail/store">Retail/Store</option>
                      <option value="commercial">Commercial</option>
                      <option value="storage unit">Storage Unit</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.dropoff_building_type === 'other' && (
                      <input
                        type="text"
                        name="dropoff_building_type_custom"
                        value={formData.dropoff_building_type_custom || ''}
                        onChange={handleChange}
                        placeholder="Please describe dropoff location type"
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                </div>

                {['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-slate-800">Pickup Location Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickup_floor" className="block text-sm font-medium text-slate-700 mb-2">
                          Floor/Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="pickup_floor"
                          name="pickup_floor"
                          value={formData.pickup_floor}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type)}
                        >
                          <option value="">Select floor</option>
                          <option value="Ground floor">Ground floor</option>
                          <option value="Basement">Basement</option>
                          <option value="2nd floor">2nd floor</option>
                          <option value="3rd floor">3rd floor</option>
                          <option value="4th+ floor">4th+ floor</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="pickup_elevator_available" className="block text-sm font-medium text-slate-700 mb-2">
                          Elevator Available <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="pickup_elevator_available"
                          name="pickup_elevator_available"
                          value={formData.pickup_elevator_available}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type)}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Not sure">Not sure</option>
                          <option value="Not applicable">Not applicable</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="pickup_stairs" className="block text-sm font-medium text-slate-700 mb-2">
                          Stairs Required <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="pickup_stairs"
                          name="pickup_stairs"
                          value={formData.pickup_stairs}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type)}
                        >
                          <option value="">Select</option>
                          <option value="No">No</option>
                          <option value="Yes — 1 flight">Yes — 1 flight</option>
                          <option value="Yes — 2 flights">Yes — 2 flights</option>
                          <option value="Yes — 3+ flights">Yes — 3+ flights</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="pickup_unit_suite" className="block text-sm font-medium text-slate-700 mb-2">
                          Unit/Suite/Locker Number
                        </label>
                        <input
                          type="text"
                          id="pickup_unit_suite"
                          name="pickup_unit_suite"
                          value={formData.pickup_unit_suite || ''}
                          onChange={handleChange}
                          placeholder="e.g., Apt 4B, Suite 201"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      </div>
                    </div>

                    {(formData.pickup_stairs === 'Yes — 1 flight' || formData.pickup_stairs === 'Yes — 2 flights' || formData.pickup_stairs === 'Yes — 3+ flights') && (
                      <div className="bg-amber-50 border border-amber-300 text-amber-700 p-3 rounded">
                        ⚠ Stairs or higher floors may affect final pricing.
                      </div>
                    )}
                  </div>
                )}

                {['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-slate-800">Dropoff Location Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropoff_floor" className="block text-sm font-medium text-slate-700 mb-2">
                          Floor/Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="dropoff_floor"
                          name="dropoff_floor"
                          value={formData.dropoff_floor}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type)}
                        >
                          <option value="">Select floor</option>
                          <option value="Ground floor">Ground floor</option>
                          <option value="Basement">Basement</option>
                          <option value="2nd floor">2nd floor</option>
                          <option value="3rd floor">3rd floor</option>
                          <option value="4th+ floor">4th+ floor</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dropoff_elevator_available" className="block text-sm font-medium text-slate-700 mb-2">
                          Elevator Available <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="dropoff_elevator_available"
                          name="dropoff_elevator_available"
                          value={formData.dropoff_elevator_available}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type)}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Not sure">Not sure</option>
                          <option value="Not applicable">Not applicable</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dropoff_stairs" className="block text-sm font-medium text-slate-700 mb-2">
                          Stairs Required <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="dropoff_stairs"
                          name="dropoff_stairs"
                          value={formData.dropoff_stairs}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type)}
                        >
                          <option value="">Select</option>
                          <option value="No">No</option>
                          <option value="Yes — 1 flight">Yes — 1 flight</option>
                          <option value="Yes — 2 flights">Yes — 2 flights</option>
                          <option value="Yes — 3+ flights">Yes — 3+ flights</option>
                          <option value="Not sure">Not sure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dropoff_unit_suite" className="block text-sm font-medium text-slate-700 mb-2">
                          Unit/Suite/Locker Number
                        </label>
                        <input
                          type="text"
                          id="dropoff_unit_suite"
                          name="dropoff_unit_suite"
                          value={formData.dropoff_unit_suite || ''}
                          onChange={handleChange}
                          placeholder="e.g., Apt 4B, Suite 201"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      </div>
                    </div>

                    {(formData.dropoff_stairs === 'Yes — 1 flight' || formData.dropoff_stairs === 'Yes — 2 flights' || formData.dropoff_stairs === 'Yes — 3+ flights') && (
                      <div className="bg-amber-50 border border-amber-300 text-amber-700 p-3 rounded">
                        ⚠ Stairs or higher floors may affect final pricing.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickup_access" className="block text-sm font-medium text-slate-700 mb-2">
                      Pickup Access <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickup_access"
                      name="pickup_access"
                      value={formData.pickup_access}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select access type</option>
                      <option value="curbside">Curbside</option>
                      <option value="driveway/garage">Driveway/Garage</option>
                      <option value="elevator">Elevator</option>
                      <option value="stairs">Stairs</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.pickup_access === 'other' && (
                      <input
                        type="text"
                        name="pickup_access_custom"
                        value={formData.pickup_access_custom || ''}
                        onChange={handleChange}
                        placeholder="Please describe pickup access"
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="dropoff_access" className="block text-sm font-medium text-slate-700 mb-2">
                      Dropoff Access <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="dropoff_access"
                      name="dropoff_access"
                      value={formData.dropoff_access}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select access type</option>
                      <option value="curbside">Curbside</option>
                      <option value="driveway/garage">Driveway/Garage</option>
                      <option value="elevator">Elevator</option>
                      <option value="stairs">Stairs</option>
                      <option value="other">Other</option>
                    </select>
                    {formData.dropoff_access === 'other' && (
                      <input
                        type="text"
                        name="dropoff_access_custom"
                        value={formData.dropoff_access_custom || ''}
                        onChange={handleChange}
                        placeholder="Please describe dropoff access"
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assistance_pickup" className="block text-sm font-medium text-slate-700 mb-2">
                      Assistance Needed at Pickup <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assistance_pickup"
                      name="assistance_pickup"
                      value={formData.assistance_pickup}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select assistance level</option>
                      <option value="none">None</option>
                      <option value="light">Light (pointing/guidance)</option>
                      <option value="medium">Medium (partial lifting)</option>
                      <option value="heavy">Heavy (full assistance)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assistance_dropoff" className="block text-sm font-medium text-slate-700 mb-2">
                      Assistance Needed at Dropoff <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assistance_dropoff"
                      name="assistance_dropoff"
                      value={formData.assistance_dropoff}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      <option value="">Select assistance level</option>
                      <option value="none">None</option>
                      <option value="light">Light (pointing/guidance)</option>
                      <option value="medium">Medium (partial lifting)</option>
                      <option value="heavy">Heavy (full assistance)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Details (optional)
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

            {/* Terms Section */}
            <fieldset>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">
                    I confirm that the pricing provided is subject to review and labour is not guaranteed until confirmed by HiveHaul™. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </fieldset>

            {/* Operational Waiver Checklist */}
            <fieldset>
              <legend className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
                Important Confirmations <span className="text-red-500">*</span>
              </legend>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="confirm_item_details_accurate"
                    checked={formData.confirm_item_details_accurate}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I confirm item details provided are accurate</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="understand_pricing_may_change"
                    checked={formData.understand_pricing_may_change}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I understand pricing may change if details differ from actual conditions</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="confirm_no_prohibited_items"
                    checked={formData.confirm_no_prohibited_items}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I confirm no prohibited or hazardous materials are included</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="understand_hivehaul_approval_required"
                    checked={formData.understand_hivehaul_approval_required}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I understand HiveHaul approval is required before booking is confirmed</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="understand_deposit_may_be_required"
                    checked={formData.understand_deposit_may_be_required}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I understand a booking deposit may be required</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree_to_terms_and_service"
                    checked={formData.agree_to_terms_and_service}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I agree to HiveHaul service terms</span>
                </label>
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
