import { Building2, TrendingUp, ExternalLink, Flag } from 'lucide-react'
import VerificationBadge from '@/components/UI/VerificationBadge'
import SourceCitation from '@/components/Company/SourceCitation'
import { EventWithCompany, SECTOR_LABELS } from '@/lib/types'

interface Props {
  event: EventWithCompany
  onDispute?: (tagId: string) => void
}

export default function CompanyTag({ event, onDispute }: Props) {
  if (!event.company_name) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
        <Building2 size={20} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Ownership unverified</p>
        <p className="text-xs text-gray-400 mt-1">
          Do you know which company cleared this area?
        </p>
        <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">
          Submit a tag →
        </button>
      </div>
    )
  }

  const sectorLabel = event.company_sector ? SECTOR_LABELS[event.company_sector] : ''

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Company header */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-0.5">{event.tag_type?.replace(/_/g, ' ')}</p>
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {event.company_name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {sectorLabel && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {sectorLabel}
                </span>
              )}
              {event.is_publicly_listed && event.stock_ticker && (
                <span className="text-xs font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} />
                  {event.stock_ticker} · KLSE
                </span>
              )}
            </div>
          </div>
          {event.tag_status && (
            <VerificationBadge status={event.tag_status} size="sm" />
          )}
        </div>

        {/* Action links */}
        <div className="flex items-center gap-3 mt-3">
          <a
            href={`/companies/${event.company_id}`}
            className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
          >
            View full profile <ExternalLink size={10} />
          </a>
          {onDispute && event.tag_id && (
            <button
              onClick={() => onDispute(event.tag_id!)}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <Flag size={10} /> Dispute this tag
            </button>
          )}
        </div>
      </div>

      {/* Source citation — always shown, non-negotiable */}
      {event.source_url && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">
            Source for this tag
          </p>
          <SourceCitation
            title={event.source_title || 'Source document'}
            url={event.source_url}
            sourceType="government_filing"
            reliabilityTier={event.reliability_tier}
          />
        </div>
      )}

      {/* Dispute warning */}
      {event.tag_status === 'disputed' && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs text-red-700 font-medium">
            ⚠ This tag is disputed. Treat it with caution while it is under review.
          </p>
        </div>
      )}
    </div>
  )
}
