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
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:ca`
    const response = await fetch(url, {
      headers: { Referer: 'https://www.hivehaul.ca' },
    })
    const data = await response.json()

    const predictionsCount = data.predictions?.length ?? 0
    console.log(`[Places/autocomplete] status="${data.status}" predictions=${predictionsCount}${data.error_message ? ` error="${data.error_message}"` : ''}`)

    if (data.error_message) {
      console.error(`[Places/autocomplete] Google API error: status=${data.status} message="${data.error_message}"`)
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[Places/autocomplete] Fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch from Google' }, { status: 502 })
  }
}
