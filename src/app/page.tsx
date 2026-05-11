'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Search, TreePine, Info, X } from 'lucide-react'
import { EventWithCompany } from '@/lib/types'
import EventPanel from '@/components/Map/EventPanel'

// Leaflet must be loaded client-side only (no SSR)
const MapView = dynamic(() => import('@/components/Map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center text-gray-500">
        <TreePine size={32} className="mx-auto mb-2 animate-pulse text-green-500" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  ),
})

const STATES = [
  'All states', 'Sabah', 'Sarawak', 'Pahang', 'Johor',
  'Perak', 'Kelantan', 'Terengganu', 'Kedah', 'Selangor',
]

const DAY_OPTIONS = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 12 months', value: 365 },
]

export default function HomePage() {
  const [events, setEvents] = useState<EventWithCompany[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventWithCompany | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [state, setState] = useState('All states')
  const [days, setDays] = useState(90)
  const [companySearch, setCompanySearch] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ days: String(days) })
      if (state !== 'All states') params.set('state', state)
      if (companySearch.trim()) params.set('company', companySearch.trim())

      const res = await fetch(`/api/events?${params}`)
      if (!res.ok) throw new Error('Failed to load events')
      const { events: data } = await res.json()
      setEvents(data)
    } catch (e) {
      setError('Could not load forest events. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [state, days, companySearch])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const totalHa = events.reduce((sum, e) => sum + e.area_ha, 0)
  const taggedCount = events.filter(e => e.company_name).length

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <TreePine size={22} className="text-green-400" />
          <div>
            <h1 className="font-bold text-white leading-none text-base">MYHUTAN</h1>
            <p className="text-[10px] text-gray-400 leading-none">Malaysian jungle tracker · Education</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {loading ? (
            <span className="text-gray-500 animate-pulse">Loading…</span>
          ) : (
            <>
              <span className="text-gray-300">
                <span className="text-red-400 font-semibold">{events.length}</span> events
              </span>
              <span className="text-gray-300">
                <span className="text-red-400 font-semibold">{Math.round(totalHa).toLocaleString()}</span> ha lost
              </span>
              <span className="text-gray-300">
                <span className="text-amber-400 font-semibold">{taggedCount}</span> companies tagged
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href="/learn" className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800">Learn</a>
          <a href="/companies" className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800">Companies</a>
        </div>
      </header>

      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
          <Search size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search company…"
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
          />
          {companySearch && (
            <button onClick={() => setCompanySearch('')} className="text-gray-500 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
        <select
          value={state}
          onChange={e => setState(e.target.value)}
          className="bg-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 outline-none border-0 cursor-pointer hover:bg-gray-700"
        >
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="bg-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 outline-none border-0 cursor-pointer hover:bg-gray-700"
        >
          {DAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Info size={14} />
            {error}
            <button onClick={fetchEvents} className="underline ml-2">Retry</button>
          </div>
        )}

        <MapView
          events={events}
          selectedEventId={selectedEvent?.id ?? null}
          onEventSelect={setSelectedEvent}
        />

        <div className="absolute bottom-6 left-4 z-[999] bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 text-xs text-gray-300 space-y-1.5 border border-gray-700">
          <p className="font-semibold text-gray-200 text-[11px] uppercase tracking-wide mb-2">Forest type</p>
          {[
            { color: '#E24B4A', label: 'Primary forest' },
            { color: '#BA7517', label: 'Peatland' },
            { color: '#534AB7', label: 'Mangrove' },
            { color: '#EF9F27', label: 'Secondary forest' },
            { color: '#888780', label: 'Disputed event' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
          <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-700 pt-2">Marker size = area cleared</p>
        </div>

        <EventPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </div>
  )
}
