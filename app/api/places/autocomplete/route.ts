import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input')
  if (!input) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:ca`
  const response = await fetch(url, {
    headers: { Referer: 'https://www.hivehaul.ca' },
  })
  const data = await response.json()
  if (data.error_message) {
    console.error('Google Places autocomplete error:', data.status, data.error_message)
  }
  return NextResponse.json(data)
}
