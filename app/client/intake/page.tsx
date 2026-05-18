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
  pickup_house_access_level?: string
  dropoff_house_access_level?: string
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
  pickup_buzz_code?: string
  pickup_entry_instructions?: string
  dropoff_floor?: string
  dropoff_elevator_available?: string
  dropoff_stairs?: string
  dropoff_unit_suite?: string
  dropoff_buzz_code?: string
  dropoff_entry_instructions?: string
  notes: string
  terms_accepted: boolean
  confirm_item_details_accurate: boolean
  understand_pricing_may_change: boolean
  confirm_no_prohibited_items: boolean
  understand_hivehaul_approval_required: boolean
  understand_deposit_may_be_required: boolean
  agree_to_terms_and_service: boolean
  confirm_cargo_declared_accurately: boolean
  understand_cargo_responsibility: boolean
  confirm_cargo_details_truthful: boolean
}

const INSIDE_BUILDING_ACCESS = [
  'front door',
  'side entrance',
  'backyard/rear',
  'front entrance',
  'elevator',
  'stairs',
  'mall entrance',
  'underground access',
  'other'
]

const OUTSIDE_ONLY_ACCESS = [
  'curbside',
  'driveway/garage',
  'driveway / garage',
  'loading dock',
  'shipping/receiving area',
  'rear entrance'
]

const requiresFloorLevel = (accessPoint: string): boolean => {
  return INSIDE_BUILDING_ACCESS.includes(accessPoint.toLowerCase())
}

const requiresBuildingAccessDetails = (accessPoint: string): boolean => {
  return INSIDE_BUILDING_ACCESS.includes(accessPoint.toLowerCase())
}

const shouldShowBuzzCode = (buildingType: string, accessPoint: string): boolean => {
  // Show buzz code for Condo/Apartment, Commercial, or Storage Unit (non-curbside)
  const validBuildingTypes = ['condo/apartment', 'commercial', 'storage unit']
  const isCurbside = accessPoint.toLowerCase() === 'curbside'

  return validBuildingTypes.includes(buildingType.toLowerCase()) && !isCurbside
}

export default function IntakePage() {
  const router = useRouter()
  const [conditionsExpanded, setConditionsExpanded] = useState(false)
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
    pickup_house_access_level: '',
    dropoff_house_access_level: '',
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
    pickup_buzz_code: '',
    pickup_entry_instructions: '',
    dropoff_floor: '',
    dropoff_elevator_available: '',
    dropoff_stairs: '',
    dropoff_unit_suite: '',
    dropoff_buzz_code: '',
    dropoff_entry_instructions: '',
    notes: '',
    terms_accepted: false,
    confirm_item_details_accurate: false,
    understand_pricing_may_change: false,
    confirm_no_prohibited_items: false,
    understand_hivehaul_approval_required: false,
    understand_deposit_may_be_required: false,
    agree_to_terms_and_service: false,
    confirm_cargo_declared_accurately: false,
    understand_cargo_responsibility: false,
    confirm_cargo_details_truthful: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any

    if (name === 'pickup_access' || name === 'dropoff_access') {
      const location = name === 'pickup_access' ? 'pickup' : 'dropoff'
      handleAccessChange(location, value)
    } else if (name === 'pickup_building_type' || name === 'dropoff_building_type') {
      const location = name === 'pickup_building_type' ? 'pickup' : 'dropoff'
      handleBuildingTypeChange(location, value)
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleAccessChange = (location: 'pickup' | 'dropoff', newAccess: string) => {
    updateFormData(`${location}_access`, newAccess)

    if (OUTSIDE_ONLY_ACCESS.includes(newAccess.toLowerCase())) {
      updateFormData(`${location}_floor`, '')
      updateFormData(`${location}_elevator_available`, '')
      updateFormData(`${location}_stairs`, '')
      updateFormData(`${location}_unit_suite`, '')
      updateFormData(`${location}_buzz_code`, '')
      updateFormData(`${location}_entry_instructions`, '')
      if (location === 'pickup') {
        updateFormData('pickup_house_access_level', '')
      } else {
        updateFormData('dropoff_house_access_level', '')
      }
    }
  }

  const handleBuildingTypeChange = (location: 'pickup' | 'dropoff', newBuildingType: string) => {
    updateFormData(`${location}_building_type`, newBuildingType)

    // Clear building access details when switching to House, Retail, or Curbside
    const typesToClear = ['house', 'retail/store', 'retail', 'other']
    if (typesToClear.includes(newBuildingType.toLowerCase())) {
      updateFormData(`${location}_buzz_code`, '')
      updateFormData(`${location}_unit_suite`, '')
      updateFormData(`${location}_entry_instructions`, '')
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
                      Approximate Size/Dimensions
                    </label>
                    <input
                      id="approximate_size"
                      type="text"
                      name="approximate_size"
                      value={formData.approximate_size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      placeholder="e.g., 6ft x 3ft x 2ft or 5 boxes"
                    />
                  </div>
                  <div>
                    <label htmlFor="approximate_weight" className="block text-sm font-medium text-slate-700 mb-2">
                      Approximate Weight
                    </label>
                    <input
                      id="approximate_weight"
                      type="text"
                      name="approximate_weight"
                      value={formData.approximate_weight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                      Pickup Property Type <span className="text-red-500">*</span>
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
                      Drop-off Property Type <span className="text-red-500">*</span>
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

                {formData.pickup_building_type === 'house' && requiresFloorLevel(formData.pickup_access) && (
                  <div>
                    <label htmlFor="pickup_house_access_level" className="block text-sm font-medium text-slate-700 mb-2">
                      Pickup House Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickup_house_access_level"
                      name="pickup_house_access_level"
                      value={formData.pickup_house_access_level || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required={formData.pickup_building_type === 'house' && requiresFloorLevel(formData.pickup_access)}
                    >
                      <option value="">Select level</option>
                      <option value="Curbside">Curbside</option>
                      <option value="Main floor">Main floor</option>
                      <option value="Basement">Basement</option>
                      <option value="Upper floor">Upper floor</option>
                      <option value="Multiple levels">Multiple levels</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                )}

                {formData.dropoff_building_type === 'house' && requiresFloorLevel(formData.dropoff_access) && (
                  <div>
                    <label htmlFor="dropoff_house_access_level" className="block text-sm font-medium text-slate-700 mb-2">
                      Dropoff House Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="dropoff_house_access_level"
                      name="dropoff_house_access_level"
                      value={formData.dropoff_house_access_level || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required={formData.dropoff_building_type === 'house' && requiresFloorLevel(formData.dropoff_access)}
                    >
                      <option value="">Select level</option>
                      <option value="Curbside">Curbside</option>
                      <option value="Main floor">Main floor</option>
                      <option value="Basement">Basement</option>
                      <option value="Upper floor">Upper floor</option>
                      <option value="Multiple levels">Multiple levels</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                )}

                {['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type) && requiresFloorLevel(formData.pickup_access) && (
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type) && requiresFloorLevel(formData.pickup_access)}
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type) && requiresFloorLevel(formData.pickup_access)}
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.pickup_building_type) && requiresFloorLevel(formData.pickup_access)}
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

                {requiresBuildingAccessDetails(formData.pickup_access) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-slate-800">Pickup Building Access Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shouldShowBuzzCode(formData.pickup_building_type, formData.pickup_access) && (
                        <div className="sm:col-span-2">
                          <label htmlFor="pickup_buzz_code" className="block text-sm font-medium text-slate-700 mb-2">
                            {formData.pickup_building_type === 'storage unit' ? 'Access / Gate Code (optional)' : 'Buzz Code (optional)'}
                          </label>
                          <input
                            type="text"
                            id="pickup_buzz_code"
                            name="pickup_buzz_code"
                            value={formData.pickup_buzz_code || ''}
                            onChange={handleChange}
                            placeholder="e.g., 4321 or Unit 1208"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          />
                          <p className="text-xs text-slate-500 mt-1">Leave blank if not applicable or if you prefer to provide access details later.</p>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label htmlFor="pickup_entry_instructions" className="block text-sm font-medium text-slate-700 mb-2">
                          Additional Entry Instructions
                        </label>
                        <textarea
                          id="pickup_entry_instructions"
                          name="pickup_entry_instructions"
                          value={formData.pickup_entry_instructions || ''}
                          onChange={handleChange}
                          placeholder="Use south entrance, call on arrival, security desk on level 1, etc."
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type) && requiresFloorLevel(formData.dropoff_access) && (
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type) && requiresFloorLevel(formData.dropoff_access)}
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type) && requiresFloorLevel(formData.dropoff_access)}
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
                          required={['condo/apartment', 'commercial', 'storage unit', 'other'].includes(formData.dropoff_building_type) && requiresFloorLevel(formData.dropoff_access)}
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

                {requiresBuildingAccessDetails(formData.dropoff_access) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-slate-800">Dropoff Building Access Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {shouldShowBuzzCode(formData.dropoff_building_type, formData.dropoff_access) && (
                        <div className="sm:col-span-2">
                          <label htmlFor="dropoff_buzz_code" className="block text-sm font-medium text-slate-700 mb-2">
                            {formData.dropoff_building_type === 'storage unit' ? 'Access / Gate Code (optional)' : 'Buzz Code (optional)'}
                          </label>
                          <input
                            type="text"
                            id="dropoff_buzz_code"
                            name="dropoff_buzz_code"
                            value={formData.dropoff_buzz_code || ''}
                            onChange={handleChange}
                            placeholder="e.g., 4321 or Unit 1208"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                          />
                          <p className="text-xs text-slate-500 mt-1">Leave blank if not applicable or if you prefer to provide access details later.</p>
                        </div>
                      )}

                      <div className="sm:col-span-2">
                        <label htmlFor="dropoff_entry_instructions" className="block text-sm font-medium text-slate-700 mb-2">
                          Additional Entry Instructions
                        </label>
                        <textarea
                          id="dropoff_entry_instructions"
                          name="dropoff_entry_instructions"
                          value={formData.dropoff_entry_instructions || ''}
                          onChange={handleChange}
                          placeholder="Use south entrance, call on arrival, security desk on level 1, etc."
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pickup_access" className="block text-sm font-medium text-slate-700 mb-2">
                      Loading Point <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="pickup_access"
                      name="pickup_access"
                      value={formData.pickup_access}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      {formData.pickup_building_type === 'house' ? (
                        <>
                          <option value="">Select loading point</option>
                          <option value="curbside">Curbside</option>
                          <option value="driveway/garage">Driveway / Garage</option>
                          <option value="front door">Front door</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="backyard/rear">Backyard / Rear access</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.pickup_building_type === 'retail/store' ? (
                        <>
                          <option value="">Select loading point</option>
                          <option value="front entrance">Front entrance</option>
                          <option value="rear entrance">Rear entrance</option>
                          <option value="loading dock">Loading dock</option>
                          <option value="mall entrance">Mall entrance</option>
                          <option value="curbside">Curbside</option>
                          <option value="shipping/receiving area">Shipping/Receiving area</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.pickup_building_type === 'commercial' ? (
                        <>
                          <option value="">Select access point</option>
                          <option value="front entrance">Front entrance</option>
                          <option value="rear entrance">Rear entrance</option>
                          <option value="loading dock">Loading dock</option>
                          <option value="shipping/receiving area">Shipping/Receiving area</option>
                          <option value="elevator">Elevator</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="underground access">Underground access</option>
                          <option value="curbside">Curbside</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.pickup_building_type === 'storage unit' ? (
                        <>
                          <option value="">Select loading point</option>
                          <option value="curbside">Curbside</option>
                          <option value="parking lot">Parking Lot</option>
                          <option value="main entrance">Main Entrance</option>
                          <option value="other entrance">Other Entrance</option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="">Select access type</option>
                          <option value="curbside">Curbside</option>
                          <option value="driveway/garage">Driveway/Garage</option>
                          <option value="elevator">Elevator</option>
                          <option value="stairs">Stairs</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                    {formData.pickup_access === 'other' && (
                      <input
                        type="text"
                        name="pickup_access_custom"
                        value={formData.pickup_access_custom || ''}
                        onChange={handleChange}
                        placeholder={`Please describe ${
                          formData.pickup_building_type === 'house' ? 'loading point' :
                          formData.pickup_building_type === 'retail/store' ? 'loading point' :
                          formData.pickup_building_type === 'commercial' ? 'access point' :
                          'access'
                        }`}
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="dropoff_access" className="block text-sm font-medium text-slate-700 mb-2">
                      Unloading Point <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="dropoff_access"
                      name="dropoff_access"
                      value={formData.dropoff_access}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      required
                    >
                      {formData.dropoff_building_type === 'house' ? (
                        <>
                          <option value="">Select unloading point</option>
                          <option value="curbside">Curbside</option>
                          <option value="driveway/garage">Driveway / Garage</option>
                          <option value="front door">Front door</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="backyard/rear">Backyard / Rear access</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.dropoff_building_type === 'retail/store' ? (
                        <>
                          <option value="">Select unloading point</option>
                          <option value="front entrance">Front entrance</option>
                          <option value="rear entrance">Rear entrance</option>
                          <option value="loading dock">Loading dock</option>
                          <option value="mall entrance">Mall entrance</option>
                          <option value="curbside">Curbside</option>
                          <option value="shipping/receiving area">Shipping/Receiving area</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.dropoff_building_type === 'commercial' ? (
                        <>
                          <option value="">Select access point</option>
                          <option value="front entrance">Front entrance</option>
                          <option value="rear entrance">Rear entrance</option>
                          <option value="loading dock">Loading dock</option>
                          <option value="shipping/receiving area">Shipping/Receiving area</option>
                          <option value="elevator">Elevator</option>
                          <option value="side entrance">Side entrance</option>
                          <option value="underground access">Underground access</option>
                          <option value="curbside">Curbside</option>
                          <option value="other">Other</option>
                        </>
                      ) : formData.dropoff_building_type === 'storage unit' ? (
                        <>
                          <option value="">Select unloading point</option>
                          <option value="curbside">Curbside</option>
                          <option value="parking lot">Parking Lot</option>
                          <option value="main entrance">Main Entrance</option>
                          <option value="other entrance">Other Entrance</option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="">Select access type</option>
                          <option value="curbside">Curbside</option>
                          <option value="driveway/garage">Driveway/Garage</option>
                          <option value="elevator">Elevator</option>
                          <option value="stairs">Stairs</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                    {formData.dropoff_access === 'other' && (
                      <input
                        type="text"
                        name="dropoff_access_custom"
                        value={formData.dropoff_access_custom || ''}
                        onChange={handleChange}
                        placeholder={`Please describe ${
                          formData.dropoff_building_type === 'house' ? 'unloading point' :
                          formData.dropoff_building_type === 'retail/store' ? 'unloading point' :
                          formData.dropoff_building_type === 'commercial' ? 'access point' :
                          'access'
                        }`}
                        className="w-full px-4 py-2 mt-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    )}
                  </div>
                </div>

                {/* Fee expectation notices */}
                {formData.pickup_access && (
                  <div className="space-y-3">
                    {formData.pickup_access.toLowerCase() === 'curbside' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">Curbside pickup usually keeps your cost lower.</p>
                      </div>
                    )}
                    {formData.pickup_access && formData.pickup_access.toLowerCase() !== 'curbside' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">Extra handling time may affect the final quote depending on distance from vehicle, access, and item size.</p>
                      </div>
                    )}
                  </div>
                )}

                {(formData.pickup_stairs === 'yes' || formData.pickup_stairs === 'yes — multiple' || formData.pickup_floor === 'Basement' || formData.pickup_floor === 'Underground') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">Stairs or non-ground-level access may require additional labour/time and may affect the final quote.</p>
                  </div>
                )}

                {formData.dropoff_access && (
                  <div className="space-y-3">
                    {formData.dropoff_access.toLowerCase() === 'curbside' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">Curbside drop-off usually keeps your cost lower.</p>
                      </div>
                    )}
                    {formData.dropoff_access && formData.dropoff_access.toLowerCase() !== 'curbside' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">Extra handling time may affect the final quote depending on distance from vehicle, access, and item size.</p>
                      </div>
                    )}
                  </div>
                )}

                {(formData.dropoff_stairs === 'yes' || formData.dropoff_stairs === 'yes — multiple' || formData.dropoff_floor === 'Basement' || formData.dropoff_floor === 'Underground') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">Stairs or non-ground-level access may require additional labour/time and may affect the final quote.</p>
                  </div>
                )}

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

            {/* Communication Expectations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>How we'll stay in touch:</strong> We'll use your phone number and email to communicate about your request, provide a quote, confirm deposit details, schedule your move, and send delivery updates. Currently, these communications are sent manually by our team.
              </p>
            </div>

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
                    name="confirm_cargo_details_truthful"
                    checked={formData.confirm_cargo_details_truthful}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I confirm that all cargo details and declarations provided are accurate and truthful</span>
                </label>

              </div>
            </fieldset>

            {/* HiveHaul Service Conditions */}
            <fieldset>
              <div className="space-y-4">
                {/* Collapsible Conditions Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setConditionsExpanded(!conditionsExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-left">HiveHaul Service Conditions</span>
                    <span className={`text-slate-600 text-xl transition-transform ${conditionsExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {conditionsExpanded && (
                    <div className="border-t border-slate-200 p-4 bg-white space-y-4 text-sm text-slate-700">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Service Terms</h4>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Service requests are reviewed before confirmation</li>
                          <li>Pricing may change if item details, access conditions, stairs, floors, weight, or labour needs differ from information provided</li>
                          <li>Certain items may require additional fees or cannot be transported</li>
                          <li>Firearms, ammunition, explosives, hazardous materials, illegal substances, drugs, controlled substances, and dangerous goods are not permitted. Common household items like small lighters or normal consumer goods are acceptable, but restricted, illegal, or dangerous materials cannot be transported.</li>
                          <li>Stairs, higher floors, long walking distances, and limited access may affect final pricing</li>
                          <li>HiveHaul does not provide storage inside the vehicle cabin. Items must be suitable for transport in the cargo/truck area unless approved by HiveHaul.</li>
                          <li>Booking may require a deposit before scheduling</li>
                          <li>Customer is responsible for providing accurate information</li>
                          <li>HiveHaul reserves the right to refuse, decline, postpone, or cancel service where safety concerns, prohibited items, inaccurate information, legal requirements, or policy violations are identified</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Cancellation Policy</h4>
                        <ul className="space-y-2 list-disc list-inside">
                          <li><strong>More than 24 hours before scheduled service:</strong> No cancellation fee</li>
                          <li><strong>Less than 24 hours before scheduled service:</strong> Booking deposit may be partially or fully non-refundable</li>
                          <li><strong>Same-day cancellation or customer no-show:</strong> May be subject to cancellation charges and loss of deposit</li>
                          <li><strong>If HiveHaul has already started travel, routing, pickup, or reserved time:</strong> Additional charges may apply</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Rescheduling</h4>
                        <p>Rescheduling is subject to availability and may affect pricing or timing.</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Transport & Safety Policy</h4>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Customers are solely responsible for the accuracy, legality, ownership, and declaration of transported items.</li>
                          <li>By submitting a request, the customer confirms that all cargo information provided is accurate and complete.</li>
                          <li>HiveHaul relies on customer-provided information and does not assume responsibility for undeclared, misrepresented, prohibited, or unlawful contents.</li>
                          <li>Providing false, misleading, or incomplete cargo information may result in immediate cancellation of service and loss of applicable booking deposits.</li>
                          <li>HiveHaul reserves the right to refuse, decline, postpone, or cancel service where safety concerns, prohibited items, inaccurate information, legal requirements, or policy violations are identified. HiveHaul may cooperate with authorities where required by law.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Cargo Declaration & Restricted Items Policy</h4>
                        <ul className="space-y-2 list-disc list-inside">
                          <li>Customers are responsible for accurately declaring the contents of all cargo before transport.</li>
                          <li>HiveHaul does not transport prohibited, illegal, or restricted items including but not limited to: illegal drugs or narcotics, undeclared controlled substances, firearms, ammunition, explosives, hazardous materials, dangerous goods, stolen property, or prohibited or unlawful items.</li>
                          <li>If cargo, packaging, or circumstances reasonably appear inconsistent with the submitted request details, HiveHaul reserves the right to request additional information, refuse, decline, postpone, or cancel service.</li>
                          <li>Failure to accurately declare transported items may result in cancellation of service without refund of applicable booking deposits.</li>
                          <li>HiveHaul reserves the right to refuse, decline, postpone, or cancel service where safety concerns, prohibited items, inaccurate information, legal requirements, or policy violations are identified. HiveHaul may cooperate with authorities where required by law.</li>
                          <li>The customer remains solely responsible for the legality and declaration of transported contents.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Final Agreement Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <input
                    type="checkbox"
                    name="agree_to_terms_and_service"
                    checked={formData.agree_to_terms_and_service}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    required
                  />
                  <span className="text-sm text-slate-700">
                    I have read and agree to the HiveHaul Booking & Cancellation Policy <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </fieldset>

            {/* Cargo Declaration Checkboxes */}
            <fieldset>
              <legend className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">
                Cargo Declaration <span className="text-red-500">*</span>
              </legend>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="confirm_cargo_declared_accurately"
                    checked={formData.confirm_cargo_declared_accurately}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I confirm that I have accurately declared the contents of my cargo and understand HiveHaul restrictions.</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="understand_cargo_responsibility"
                    checked={formData.understand_cargo_responsibility}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700">I understand that I remain responsible for the contents and declared value of transported cargo.</span>
                </label>

                <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-blue-200">
                  Customers are responsible for declaring valuable, fragile, restricted, or unusual items before transport.
                </p>
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
