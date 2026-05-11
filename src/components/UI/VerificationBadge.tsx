import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, XCircle } from 'lucide-react'
import { VerificationStatus, VERIFICATION_CONFIG } from '@/lib/types'

interface Props {
  status: VerificationStatus
  size?: 'sm' | 'md'
  showDescription?: boolean
}

const ICONS: Record<VerificationStatus, React.ElementType> = {
  admin_verified:      ShieldCheck,
  ngo_verified:        ShieldCheck,
  community_unverified: Shield,
  disputed:            AlertTriangle,
  retracted:           XCircle,
}

export default function VerificationBadge({ status, size = 'sm', showDescription = false }: Props) {
  const config = VERIFICATION_CONFIG[status]
  const Icon = ICONS[status]
  const iconSize = size === 'sm' ? 12 : 14
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${textSize} w-fit`}
        style={{
          backgroundColor: config.color + '20',
          color: config.color,
          border: `1px solid ${config.color}40`,
        }}
        title={config.description}
      >
        <Icon size={iconSize} />
        {config.label}
      </span>
      {showDescription && (
        <p className="text-xs text-gray-500 leading-snug">{config.description}</p>
      )}
    </div>
  )
}
