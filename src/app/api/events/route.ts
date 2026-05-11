import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const state = searchParams.get('state')
  const days = parseInt(searchParams.get('days') || '90', 10)
  const company = searchParams.get('company')

  const supabase = await createClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - Math.min(days, 365)) // cap at 1 year

  let query = supabase
    .from('events_with_companies')
    .select('*')
    .gte('detected_at', cutoff.toISOString())
    .order('detected_at', { ascending: false })
    .limit(500)

  if (state) query = query.eq('state', state)
  if (company) query = query.ilike('company_name', `%${company}%`)

  const { data, error } = await query

  if (error) {
    console.error('[MYHUTAN] events query error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  // Parse coordinates from PostGIS geography type
  const events = (data || []).map(row => ({
    ...row,
    coordinates: parseCoordinates(row.coordinates),
  }))

  return NextResponse.json({ events }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

// PostGIS returns geography as GeoJSON — parse to { lat, lng }
function parseCoordinates(geo: unknown): { lat: number; lng: number } {
  if (!geo) return { lat: 4.2, lng: 108.0 }
  if (typeof geo === 'string') {
    try { geo = JSON.parse(geo) } catch { return { lat: 4.2, lng: 108.0 } }
  }
  const g = geo as { type: string; coordinates: number[] }
  if (g?.type === 'Point' && Array.isArray(g.coordinates)) {
    return { lat: g.coordinates[1], lng: g.coordinates[0] }
  }
  return { lat: 4.2, lng: 108.0 }
}
