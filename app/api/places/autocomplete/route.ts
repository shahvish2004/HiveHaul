import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input')

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const hasKey = Boolean(apiKey)

  if (!input) {
    return NextResponse.json({ predictions: [] })
  }

  console.log(`[Places/autocomplete] hasKey=${hasKey} input="${input}"`)

  if (!hasKey) {
    console.error('[Places/autocomplete] NEXT_PUBLIC_GOOGLE_PLACES_API_KEY is not set')
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    // Uses Places API (New) — legacy Places API must NOT be enabled; enable "Places API (New)" in GCP
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ['ca'],
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error(`[Places/autocomplete] API error: status=${res.status} body=${JSON.stringify(data)}`)
      return NextResponse.json({ predictions: [], status: 'ERROR', error_message: data.error?.message || 'API error' })
    }

    const suggestions = data.suggestions || []
    console.log(`[Places/autocomplete] suggestions=${suggestions.length}`)

    // Normalise new API response → shape the frontend already expects
    const predictions = suggestions.map((s: any) => {
      const p = s.placePrediction || {}
      return {
        place_id: p.placeId || '',
        description: p.text?.text || '',
        structured_formatting: {
          main_text: p.structuredFormat?.mainText?.text || p.text?.text || '',
          secondary_text: p.structuredFormat?.secondaryText?.text || '',
        },
      }
    })

    return NextResponse.json({ predictions, status: predictions.length ? 'OK' : 'ZERO_RESULTS' })
  } catch (err) {
    console.error('[Places/autocomplete] Fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch from Google' }, { status: 502 })
  }
}
