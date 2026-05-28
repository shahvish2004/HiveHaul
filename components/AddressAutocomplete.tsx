'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface PlacePrediction {
  place_id: string
  main_text: string
  secondary_text: string
  full_text: string
}

export interface StructuredAddress {
  formatted_address: string
  street_number: string
  street_name: string
  city: string
  province: string
  postal_code: string
  country: string
  latitude: number
  longitude: number
  place_id: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: StructuredAddress | null) => void
  onTextChange?: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  helperText?: string
  apiKey: string
  id?: string
  name?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onTextChange,
  placeholder = '123 Main Street, City, State',
  label = 'Address',
  required = false,
  helperText = 'Please select your address from suggestions when possible to reduce delivery errors.',
  apiKey,
  id,
  name,
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(value)
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [error, setError] = useState('')
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Google Places Autocomplete
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || !apiKey) {
        setSuggestions([])
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError('')

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:ca`,
          { signal: abortControllerRef.current.signal }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions')
        }

        const data = await response.json()

        if (data.error_message) {
          setError('Address service temporarily unavailable')
          setSuggestions([])
          return
        }

        const predictions: PlacePrediction[] = (data.predictions || []).map(
          (pred: any) => ({
            place_id: pred.place_id,
            main_text: pred.structured_formatting?.main_text || pred.description,
            secondary_text: pred.structured_formatting?.secondary_text || '',
            full_text: pred.description,
          })
        )

        setSuggestions(predictions)
        setShowSuggestions(predictions.length > 0)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return // Ignore aborted requests
        }
        setError('Unable to fetch address suggestions')
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    },
    [apiKey]
  )

  // Get detailed place information
  const fetchPlaceDetails = useCallback(
    async (placeId: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&key=${apiKey}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch place details')
        }

        const data = await response.json()
        const result = data.result

        if (!result) {
          setError('Could not load address details')
          return
        }

        // Parse address components
        const addressComponents = result.address_components as AddressComponent[]
        const structured: StructuredAddress = {
          formatted_address: result.formatted_address || '',
          street_number:
            addressComponents.find((c) =>
              c.types.includes('street_number')
            )?.long_name || '',
          street_name:
            addressComponents.find((c) =>
              c.types.includes('route')
            )?.long_name || '',
          city:
            addressComponents.find((c) =>
              c.types.includes('locality')
            )?.long_name || '',
          province:
            addressComponents.find((c) =>
              c.types.includes('administrative_area_level_1')
            )?.short_name || '',
          postal_code:
            addressComponents.find((c) =>
              c.types.includes('postal_code')
            )?.long_name || '',
          country:
            addressComponents.find((c) =>
              c.types.includes('country')
            )?.long_name || '',
          latitude: result.geometry?.location?.lat || 0,
          longitude: result.geometry?.location?.lng || 0,
          place_id: placeId,
        }

        setInput(structured.formatted_address)
        onChange(structured)
        setSuggestions([])
        setShowSuggestions(false)
        setShowManualEntry(false)
        setError('')
      } catch (err) {
        setError('Failed to load address details')
      }
    },
    [apiKey, onChange]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    onChange(null) // Clear structured data while typing
    onTextChange?.(newValue) // Keep raw address text in sync with parent
    setShowManualEntry(false)

    if (newValue.trim()) {
      fetchSuggestions(newValue)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: PlacePrediction) => {
    setLoading(true)
    await fetchPlaceDetails(suggestion.place_id)
  }

  // Handle manual entry toggle
  const handleManualEntry = () => {
    setShowManualEntry(!showManualEntry)
    setSuggestions([])
    setShowSuggestions(false)
    onChange(null)
  }

  // Handle manual address submission
  const handleManualSubmit = () => {
    if (input.trim()) {
      // Create a basic structured address from manual input
      onChange({
        formatted_address: input,
        street_number: '',
        street_name: input,
        city: '',
        province: '',
        postal_code: '',
        country: 'Canada',
        latitude: 0,
        longitude: 0,
        place_id: '',
      })
      setShowManualEntry(false)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required && !showManualEntry}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          autoComplete="off"
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-3 mt-1">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="text-xs text-slate-500 mt-2">{helperText}</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
              type="button"
            >
              <div className="font-medium text-slate-900 text-sm">
                {suggestion.main_text}
              </div>
              {suggestion.secondary_text && (
                <div className="text-xs text-slate-500 mt-1">
                  {suggestion.secondary_text}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Manual entry option */}
      {!showManualEntry && input.trim() && suggestions.length === 0 && !loading && (
        <button
          onClick={handleManualEntry}
          className="text-xs text-blue-600 hover:text-blue-700 mt-2 underline"
          type="button"
        >
          Can't find address? Enter manually
        </button>
      )}

      {/* Manual entry form */}
      {showManualEntry && (
        <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Enter your address manually
          </p>
          <div className="space-y-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 255 Maitland St, Kitchener, ON N2G 1K2"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleManualSubmit}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                type="button"
              >
                Use This Address
              </button>
              <button
                onClick={handleManualEntry}
                className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300 transition-colors"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
