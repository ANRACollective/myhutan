import { ExternalLink, Shield, FileText, Satellite, BookOpen, Newspaper, Users } from 'lucide-react'
import { SourceType } from '@/lib/types'

interface Props {
  title: string
  url: string
  sourceType: SourceType
  publisher?: string
  publishedAt?: string
  reliabilityTier?: number
}

const SOURCE_CONFIG: Record<SourceType, {
  label: string
  Icon: React.ElementType
  color: string
}> = {
  government_filing: { label: 'Government filing',  Icon: Shield,    color: '#1D9E75' },
  satellite_data:    { label: 'Satellite data',      Icon: Satellite,  color: '#378ADD' },
  ngo_report:        { label: 'NGO report',          Icon: FileText,   color: '#534AB7' },
  academic:          { label: 'Academic research',   Icon: BookOpen,   color: '#3C3489' },
  news:              { label: 'News media',           Icon: Newspaper,  color: '#888780' },
  community:         { label: 'Community submission', Icon: Users,      color: '#EF9F27' },
}

const TIER_LABELS = ['', 'Official source', 'Established NGO / academic', 'News media', 'Community']

export default function SourceCitation({
  title, url, sourceType, publisher, publishedAt, reliabilityTier = 3
}: Props) {
  const config = SOURCE_CONFIG[sourceType]
  const { Icon } = config

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: config.color + '15', color: config.color }}
        >
          <Icon size={10} />
          {config.label}
        </span>
        {reliabilityTier && (
          <span className="text-gray-400 text-[10px]">
            Tier {reliabilityTier} — {TIER_LABELS[reliabilityTier]}
          </span>
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:underline font-medium leading-snug flex items-start gap-1"
      >
        <span className="flex-1">{title}</span>
        <ExternalLink size={10} className="mt-0.5 flex-shrink-0 text-blue-400" />
      </a>
      {(publisher || publishedAt) && (
        <p className="text-gray-400">
          {publisher}
          {publisher && publishedAt ? ' · ' : ''}
          {publishedAt ? new Date(publishedAt).getFullYear() : ''}
        </p>
      )}
    </div>
  )
}
