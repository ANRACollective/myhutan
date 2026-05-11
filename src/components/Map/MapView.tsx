'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { EventWithCompany } from '@/lib/types'
import { MALAYSIA_BOUNDS } from '@/lib/gfw/api'

interface Props {
  events: EventWithCompany[]
  selectedEventId: string | null
  onEventSelect: (event: EventWithCompany) => void
}

// Colour-code markers by forest type
function markerColor(event: EventWithCompany): string {
  if (event.is_disputed) return '#888780'
  if (event.forest_type === 'peatland') return '#BA7517'   // amber — highest carbon risk
  if (event.forest_type === 'primary')  return '#E24B4A'   // red — highest ecological value
  if (event.forest_type === 'mangrove') return '#534AB7'   // purple
  return '#EF9F27'                                          // orange — secondary forest
}

// Marker radius scaled by area (min 6, max 24 px)
function markerRadius(areaHa: number): number {
  return Math.min(24, Math.max(6, Math.sqrt(areaHa) * 0.7))
}

// Sub-component: fly to selected event
function FlyToEvent({ event }: { event: EventWithCompany | null }) {
  const map = useMap()
  useEffect(() => {
    if (event) {
      map.flyTo([event.coordinates.lat, event.coordinates.lng], 11, { duration: 1 })
    }
  }, [event, map])
  return null
}

export default function MapView({ events, selectedEventId, onEventSelect }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const selectedEvent = events.find(e => e.id === selectedEventId) || null

  return (
    <MapContainer
      center={MALAYSIA_BOUNDS.center}
      zoom={MALAYSIA_BOUNDS.zoom}
      className="w-full h-full"
      zoomControl={false}
    >
      {/* Base map — OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
      />

      {/* GFW forest cover loss tile overlay */}
      <TileLayer
        url="https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_30/{z}/{x}/{y}.png"
        opacity={0.4}
        attribution='Tree cover loss &copy; <a href="https://www.globalforestwatch.org">Global Forest Watch</a>'
      />

      {/* Event markers */}
      {events.map(event => (
        <CircleMarker
          key={event.id}
          center={[event.coordinates.lat, event.coordinates.lng]}
          radius={markerRadius(event.area_ha)}
          pathOptions={{
            color: markerColor(event),
            fillColor: markerColor(event),
            fillOpacity: selectedEventId === event.id ? 0.9 : 0.65,
            weight: selectedEventId === event.id ? 3 : 1.5,
            opacity: 1,
          }}
          eventHandlers={{
            click: () => onEventSelect(event),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{event.state}</p>
              <p className="text-gray-600">{event.area_ha.toLocaleString()} ha cleared</p>
              {event.company_name && (
                <p className="text-xs mt-1 text-gray-500">
                  Tagged: {event.company_name}
                </p>
              )}
              <button
                onClick={() => onEventSelect(event)}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                View full details →
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      <FlyToEvent event={selectedEvent} />
    </MapContainer>
  )
}
