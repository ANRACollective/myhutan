// ============================================================
// MYHUTAN — Shared TypeScript Types
// Mirror of the database schema for type safety across the app
// ============================================================

export type SourceType =
  | 'government_filing'
  | 'satellite_data'
  | 'ngo_report'
  | 'academic'
  | 'news'
  | 'community'

export type VerificationStatus =
  | 'admin_verified'
  | 'ngo_verified'
  | 'community_unverified'
  | 'disputed'
  | 'retracted'

export type AlertType = 'GLAD_L' | 'GLAD_S2' | 'RADD' | 'VIIRS_fire' | 'manual'
export type ForestType = 'primary' | 'secondary' | 'peatland' | 'mangrove' | 'unknown'
export type Confidence = 'high' | 'nominal' | 'low'
export type Sector = 'palm_oil' | 'timber' | 'plantation' | 'mining' | 'property' | 'infrastructure' | 'conglomerate' | 'other'
export type TagType = 'concession_owner' | 'operator' | 'contractor' | 'parent_company' | 'affiliated'

export interface Source {
  id: string
  title: string
  url: string
  source_type: SourceType
  reliability_tier: 1 | 2 | 3 | 4
  publisher?: string
  published_at?: string
  accessed_at: string
  archived_url?: string
}

export interface ForestEvent {
  id: string
  gfw_alert_id?: string
  detected_at: string
  area_ha: number
  state: string
  coordinates: { lat: number; lng: number }
  forest_type: ForestType
  alert_type: AlertType
  confidence: Confidence
  co2_tonnes_est?: number
  species_at_risk?: string[]
  is_disputed: boolean
  dispute_note?: string
  data_source_id: string
}

export interface Company {
  id: string
  name: string
  name_bm?: string
  sector: Sector
  is_publicly_listed: boolean
  stock_ticker?: string
  exchange?: string
  bursa_filings_url?: string
  rspo_member: boolean
  mspo_certified: boolean
  description?: string
  website_url?: string
  verified_by?: string
  verified_at?: string
}

export interface EventCompanyTag {
  id: string
  event_id: string
  company_id: string
  concession_id?: string
  source_id: string
  tag_type: TagType
  verification_status: VerificationStatus
  verified_by?: string
  dispute_count: number
  dispute_reason?: string
  is_visible: boolean
  created_at: string
}

// Enriched view type (from events_with_companies view)
export interface EventWithCompany extends ForestEvent {
  tag_id?: string
  tag_type?: TagType
  tag_status?: VerificationStatus
  company_id?: string
  company_name?: string
  company_sector?: Sector
  is_publicly_listed?: boolean
  stock_ticker?: string
  source_title?: string
  source_url?: string
  reliability_tier?: number
}

// Map marker data (lightweight — only what the map needs)
export interface EventMarkerData {
  id: string
  lat: number
  lng: number
  area_ha: number
  state: string
  forest_type: ForestType
  alert_type: AlertType
  confidence: Confidence
  detected_at: string
  company_name?: string
  tag_status?: VerificationStatus
  is_disputed: boolean
}

// Verification badge display config
export const VERIFICATION_CONFIG: Record<VerificationStatus, {
  label: string
  color: string
  description: string
}> = {
  admin_verified: {
    label: 'Verified',
    color: '#1D9E75',
    description: 'Confirmed by the MYHUTAN team from official sources',
  },
  ngo_verified: {
    label: 'NGO Verified',
    color: '#378ADD',
    description: 'Confirmed by a trusted NGO partner organisation',
  },
  community_unverified: {
    label: 'Community tag',
    color: '#EF9F27',
    description: 'Submitted by the community — not yet independently verified',
  },
  disputed: {
    label: 'Disputed',
    color: '#E24B4A',
    description: 'This tag has been contested. View the dispute for details.',
  },
  retracted: {
    label: 'Retracted',
    color: '#888780',
    description: 'This tag was found to be incorrect and has been removed.',
  },
}

export const FOREST_TYPE_LABELS: Record<ForestType, string> = {
  primary: 'Primary (old-growth) forest',
  secondary: 'Secondary (regrowth) forest',
  peatland: 'Peat swamp forest',
  mangrove: 'Mangrove forest',
  unknown: 'Forest type unknown',
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  GLAD_L: 'GLAD-Landsat alert (weekly, 30m)',
  GLAD_S2: 'GLAD-Sentinel-2 alert (10m)',
  RADD: 'RADD radar alert (near real-time)',
  VIIRS_fire: 'VIIRS fire alert',
  manual: 'Manually reported event',
}

export const SECTOR_LABELS: Record<Sector, string> = {
  palm_oil: 'Palm oil',
  timber: 'Timber / logging',
  plantation: 'Plantation (mixed)',
  mining: 'Mining',
  property: 'Property development',
  infrastructure: 'Infrastructure',
  conglomerate: 'Conglomerate',
  other: 'Other',
}
