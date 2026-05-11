// ============================================================
// GFW (Global Forest Watch) API Integration
// Fetches GLAD/RADD deforestation alerts for Malaysia
// API Docs: https://www.globalforestwatch.org/help/developers/
// Dataset IDs: https://data.globalforestwatch.org/
// ============================================================

const GFW_API_BASE = 'https://data-api.globalforestwatch.org'

// Malaysia ISO3 country code
const MALAYSIA_ISO3 = 'MYS'

// GFW dataset IDs (stable, documented)
const DATASETS = {
  GLAD_L:  'gfw_integrated_alerts',  // GLAD Landsat + Sentinel-2 integrated
  RADD:    'wur_radd_alerts',         // Radar-based near-real-time alerts
  VIIRS:   'nasa_viirs_fire_alerts',  // Fire alerts
}

export interface GFWAlertParams {
  dataset?: keyof typeof DATASETS
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
  confidence?: 'high' | 'nominal' | 'low'
  // Optional bounding box (defaults to all Malaysia)
  bbox?: [number, number, number, number]  // [west, south, east, north]
}

export interface GFWAlert {
  gfw_alert_id: string
  detected_at: string
  area_ha: number
  longitude: number
  latitude: number
  confidence: string
  alert_type: string
}

/**
 * Fetch forest loss alerts from the GFW Data API for Malaysia.
 * Returns raw GFW alert records for ingestion into the MYHUTAN database.
 *
 * Note: Requires a GFW API token set in NEXT_PUBLIC_GFW_API_TOKEN.
 * Apply for access at: https://www.globalforestwatch.org/help/developers/
 */
export async function fetchMalaysiaAlerts(params: GFWAlertParams): Promise<GFWAlert[]> {
  const { dataset = 'GLAD_L', startDate, endDate, confidence } = params

  const datasetId = DATASETS[dataset]
  const url = `${GFW_API_BASE}/dataset/${datasetId}/latest/query`

  // GFW SQL-style query for Malaysia
  const sqlWhere = [
    `country_iso3 = '${MALAYSIA_ISO3}'`,
    `alert__date >= '${startDate}'`,
    `alert__date <= '${endDate}'`,
    confidence ? `confidence = '${confidence}'` : null,
  ].filter(Boolean).join(' AND ')

  const sql = `
    SELECT
      alert__id         AS gfw_alert_id,
      alert__date       AS detected_at,
      alert__area__ha   AS area_ha,
      longitude,
      latitude,
      confidence,
      '${dataset}'      AS alert_type
    FROM ${datasetId}
    WHERE ${sqlWhere}
    LIMIT 1000
  `

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.GFW_API_TOKEN || '',
    },
    body: JSON.stringify({ sql }),
    // Revalidate hourly — GFW alerts update daily at most
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GFW API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Returns the GFW map tile URL for a given alert dataset.
 * Used directly in Leaflet as a tile layer.
 */
export function getGFWTileUrl(dataset: keyof typeof DATASETS = 'GLAD_L'): string {
  // GFW public tile endpoints — no API key required for tiles
  const tileTemplates: Record<keyof typeof DATASETS, string> = {
    GLAD_L: 'https://tiles.globalforestwatch.org/gfw_integrated_alerts/v20220922/default/{z}/{x}/{y}.png',
    RADD:   'https://tiles.globalforestwatch.org/wur_radd_alerts/v20220914/default/{z}/{x}/{y}.png',
    VIIRS:  'https://tiles.globalforestwatch.org/nasa_viirs_fire_alerts/v20210101/default/{z}/{x}/{y}.png',
  }
  return tileTemplates[dataset]
}

/**
 * Returns the Leaflet bounds for Malaysia.
 * Used to constrain the initial map view.
 */
export const MALAYSIA_BOUNDS = {
  // [south, west, north, east]
  bounds: [[0.8, 99.5, 7.5, 119.3]] as [[number, number, number, number]],
  center: [4.2, 108.0] as [number, number],
  zoom: 6,
}
