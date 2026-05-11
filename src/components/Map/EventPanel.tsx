'use client'

import { X, Flame, MapPin, Calendar, TreePine, Wind, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { EventWithCompany, FOREST_TYPE_LABELS, ALERT_TYPE_LABELS } from '@/lib/types'
import CompanyTag from '@/components/Company/CompanyTag'
import SourceCitation from '@/components/Company/SourceCitation'

interface Props {
  event: EventWithCompany | null
  onClose: () => void
}

// Format large numbers with commas
function fmt(n: number) {
  return n.toLocaleString('en-MY', { maximumFractionDigits: 1 })
}

export default function EventPanel({ event, onClose }: Props) {
  if (!event) return null

  const detectedDate = new Date(event.detected_at)
  const footballFields = Math.round(event.area_ha * 1.4)  // 1 ha ≈ 1.4 football fields

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-[1000] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Forest loss event
          </p>
          <h2 className="font-semibold text-gray-900 mt-0.5">
            {event.state}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Calendar size={11} />
            Detected {format(detectedDate, 'd MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5">
        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-red-50 border border-red-100 p-3">
            <p className="text-xs text-red-500 font-medium mb-1 flex items-center gap-1">
              <TreePine size={11} /> Area cleared
            </p>
            <p className="text-2xl font-bold text-red-700">{fmt(event.area_ha)}</p>
            <p className="text-xs text-red-500">hectares</p>
            <p className="text-[10px] text-red-400 mt-1">
              ≈ {fmt(footballFields)} football fields
            </p>
          </div>
          {event.co2_tonnes_est ? (
            <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
                <Wind size={11} /> CO₂ released
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {event.co2_tonnes_est >= 1000
                  ? `${fmt(event.co2_tonnes_est / 1000)}k`
                  : fmt(event.co2_tonnes_est)}
              </p>
              <p className="text-xs text-amber-600">tonnes (est.)</p>
              <p className="text-[10px] text-amber-400 mt-1">
                ≈ {fmt(Math.round(event.co2_tonnes_est / 4.6))} cars/year
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs text-gray-500 font-medium mb-1">CO₂ impact</p>
              <p className="text-sm text-gray-400">Not calculated</p>
            </div>
          )}
        </div>

        {/* Event details */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Event details</h3>
          <div className="rounded-lg border border-gray-100 divide-y divide-gray-50">
            {[
              { label: 'Forest type', value: FOREST_TYPE_LABELS[event.forest_type] },
              { label: 'Detection method', value: ALERT_TYPE_LABELS[event.alert_type] },
              { label: 'Confidence', value: event.confidence.charAt(0).toUpperCase() + event.confidence.slice(1) },
              { label: 'Coordinates', value: `${event.coordinates.lat.toFixed(4)}, ${event.coordinates.lng.toFixed(4)}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center px-3 py-2 text-xs">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800 font-medium text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peatland warning */}
        {event.forest_type === 'peatland' && (
          <div className="flex gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed">
              <strong>Peatland alert:</strong> Peat swamp forests store up to 20× more carbon per hectare than other tropical forests. Clearing peatland releases carbon stored over thousands of years and often triggers hard-to-extinguish underground fires.
            </p>
          </div>
        )}

        {/* Dispute warning */}
        {event.is_disputed && (
          <div className="flex gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              This event record has been flagged as disputed. The underlying data is still shown but may be subject to correction.
            </p>
          </div>
        )}

        {/* Company accountability */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Company responsible
          </h3>
          <CompanyTag event={event} />
        </div>

        {/* Data source */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Event data source
          </h3>
          <SourceCitation
            title="Global Forest Watch Integrated Deforestation Alerts"
            url="https://www.globalforestwatch.org/help/map/analyses/how-are-glad-alerts-classified/"
            sourceType="satellite_data"
            publisher="World Resources Institute"
            reliabilityTier={1}
          />
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
          MYHUTAN displays satellite-detected forest loss data from Global Forest Watch. Company tags are sourced from public filings and community contributions. Community tags are marked clearly and have not been independently verified. If you believe any information is incorrect, use the dispute button above.
        </p>
      </div>
    </div>
  )
}
