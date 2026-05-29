import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  if (!placeId) {
    return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('[Places/details] NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  console.log(`[Places/details] placeId="${placeId}"`)

  try {
    // Uses Places API (New) — fetch address components, formatted address, and coordinates
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'formattedAddress,addressComponents,location',
          Referer: 'https://www.hivehaul.ca',
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error(`[Places/details] API error: status=${res.status} body=${JSON.stringify(data)}`)
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: res.status })
    }

    console.log(`[Places/details] formattedAddress="${data.formattedAddress}" components=${data.addressComponents?.length ?? 0}`)

    // Normalise new API response → shape the frontend already expects
    const result = {
      formatted_address: data.formattedAddress || '',
      geometry: {
        location: {
          lat: data.location?.latitude || 0,
          lng: data.location?.longitude || 0,
        },
      },
      address_components: (data.addressComponents || []).map((c: any) => ({
        long_name: c.longText || '',
        short_name: c.shortText || '',
        types: c.types || [],
      })),
    }

    return NextResponse.json({ result })
  } catch (err) {
    console.error('[Places/details] Fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch from Google' }, { status: 502 })
  }
}
