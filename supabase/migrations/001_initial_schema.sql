-- ============================================================
-- MYHUTAN Database Schema — Migration 001
-- All company tags and concession records REQUIRE a source citation.
-- This is enforced at the database level, not just the application level.
-- ============================================================

-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- SOURCES TABLE
-- Every piece of data must trace back to a source.
-- source_type tiers: 1=government/official, 2=established NGO/academic,
--                    3=news/media, 4=community-submitted
-- ============================================================
CREATE TABLE sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  source_type   TEXT NOT NULL CHECK (source_type IN (
                  'government_filing',   -- Bursa Malaysia, MPOB, JPS
                  'satellite_data',      -- GFW, Copernicus ESA, NASA
                  'ngo_report',          -- WWF, Greenpeace, Global Witness
                  'academic',            -- Peer-reviewed research
                  'news',                -- Verified news outlet
                  'community'            -- Community-submitted (lowest tier)
                )),
  reliability_tier INTEGER NOT NULL DEFAULT 3 CHECK (reliability_tier BETWEEN 1 AND 4),
  publisher     TEXT,
  published_at  DATE,
  accessed_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  archived_url  TEXT,                   -- Wayback Machine link for permanence
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOREST EVENTS TABLE
-- Deforestation events detected by satellite.
-- Primary data source: GFW GLAD/RADD alerts.
-- Each event is immutable once inserted — no updates, only flags.
-- ============================================================
CREATE TABLE forest_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gfw_alert_id    TEXT UNIQUE,           -- GFW's own identifier, for dedup
  detected_at     TIMESTAMPTZ NOT NULL,
  area_ha         NUMERIC NOT NULL CHECK (area_ha > 0),
  state           TEXT NOT NULL CHECK (state IN (
                    'Sabah', 'Sarawak', 'Johor', 'Pahang', 'Perak',
                    'Kelantan', 'Terengganu', 'Kedah', 'Perlis',
                    'Selangor', 'Negeri Sembilan', 'Melaka',
                    'Pulau Pinang', 'Perlis', 'Unknown'
                  )),
  coordinates     GEOGRAPHY(POINT, 4326) NOT NULL,
  forest_type     TEXT CHECK (forest_type IN (
                    'primary',      -- Old-growth, highest ecological value
                    'secondary',    -- Regrowth forest
                    'peatland',     -- Carbon-critical peat swamp forest
                    'mangrove',     -- Coastal mangrove
                    'unknown'
                  )),
  alert_type      TEXT NOT NULL CHECK (alert_type IN (
                    'GLAD_L',       -- Landsat-based weekly alert
                    'GLAD_S2',      -- Sentinel-2 10m alert
                    'RADD',         -- Radar-based near-real-time
                    'VIIRS_fire',   -- Fire alert (VIIRS satellite)
                    'manual'        -- Human-reported event
                  )),
  confidence      TEXT NOT NULL DEFAULT 'nominal' CHECK (confidence IN (
                    'high', 'nominal', 'low'
                  )),
  data_source_id  UUID NOT NULL REFERENCES sources(id),  -- e.g. GFW source record
  -- Ecological impact estimates (computed, nullable)
  co2_tonnes_est  NUMERIC,              -- Estimated CO2 released (tonnes)
  species_at_risk TEXT[],               -- IUCN Red List species in this area
  -- Flagging
  is_disputed     BOOLEAN NOT NULL DEFAULT FALSE,
  dispute_note    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index for map queries
CREATE INDEX forest_events_coords_idx ON forest_events USING GIST (coordinates);
CREATE INDEX forest_events_detected_at_idx ON forest_events (detected_at DESC);
CREATE INDEX forest_events_state_idx ON forest_events (state);

-- ============================================================
-- COMPANIES TABLE
-- Malaysian companies with concessions or linked to forest activity.
-- ============================================================
CREATE TABLE companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  name_bm             TEXT,             -- Malay-language name if different
  sector              TEXT NOT NULL CHECK (sector IN (
                        'palm_oil', 'timber', 'plantation', 'mining',
                        'property', 'infrastructure', 'conglomerate', 'other'
                      )),
  is_publicly_listed  BOOLEAN NOT NULL DEFAULT FALSE,
  stock_ticker        TEXT,             -- e.g. FGV, SIMEPLT
  exchange            TEXT CHECK (exchange IN ('KLSE', 'SGX', 'NYSE', 'other')),
  bursa_filings_url   TEXT,             -- Direct link to Bursa Malaysia profile
  rspo_member         BOOLEAN NOT NULL DEFAULT FALSE,
  rspo_id             TEXT,             -- RSPO membership number
  mspo_certified      BOOLEAN NOT NULL DEFAULT FALSE, -- Malaysian Sustainable Palm Oil
  description         TEXT,
  website_url         TEXT,
  -- Verification
  verified_by         TEXT,             -- Name of verifying organisation
  verified_at         TIMESTAMPTZ,
  -- Moderation
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX companies_name_idx ON companies (name);
CREATE INDEX companies_sector_idx ON companies (sector);

-- ============================================================
-- COMPANY CONCESSIONS TABLE
-- Which companies own or operate which land areas.
-- SAFEGUARD: source_id is NOT NULL — every concession claim
-- must cite a verifiable document.
-- ============================================================
CREATE TABLE company_concessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  concession_name     TEXT,
  concession_ref      TEXT,             -- Official concession/license number
  state               TEXT NOT NULL,
  area_ha             NUMERIC CHECK (area_ha > 0),
  boundary            GEOGRAPHY(POLYGON, 4326),  -- GeoJSON polygon of the concession
  -- MANDATORY CITATION — cannot insert without this
  source_id           UUID NOT NULL REFERENCES sources(id),
  -- Verification status
  verification_status TEXT NOT NULL DEFAULT 'community_unverified' CHECK (
                        verification_status IN (
                          'verified',            -- Confirmed from official source
                          'community_unverified', -- Community-submitted, not yet checked
                          'disputed',             -- Actively contested
                          'retracted'             -- Was wrong, now retracted
                        )),
  verified_by         TEXT,
  verified_at         TIMESTAMPTZ,
  dispute_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX concessions_company_idx ON company_concessions (company_id);
CREATE INDEX concessions_boundary_idx ON company_concessions USING GIST (boundary);

-- ============================================================
-- EVENT COMPANY TAGS TABLE
-- The accountability layer: linking a forest event to a company.
-- SAFEGUARD: source_id is NOT NULL — you cannot tag a company
-- without providing a verifiable source. This is the core rule.
-- ============================================================
CREATE TABLE event_company_tags (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES forest_events(id) ON DELETE CASCADE,
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  concession_id       UUID REFERENCES company_concessions(id),
  -- MANDATORY CITATION — the single most important safeguard
  source_id           UUID NOT NULL REFERENCES sources(id),
  -- Tag type
  tag_type            TEXT NOT NULL DEFAULT 'concession_owner' CHECK (tag_type IN (
                        'concession_owner',      -- Company holds the land concession
                        'operator',              -- Company operating (may differ from owner)
                        'contractor',            -- Third-party contractor
                        'parent_company',        -- Parent/holding company of owner
                        'affiliated'             -- Credibly associated, not confirmed owner
                      )),
  -- Verification pipeline
  verification_status TEXT NOT NULL DEFAULT 'community_unverified' CHECK (
                        verification_status IN (
                          'admin_verified',       -- Verified by MYHUTAN team
                          'ngo_verified',         -- Verified by trusted NGO partner
                          'community_unverified', -- Submitted by community, not checked
                          'disputed',             -- Flagged as potentially incorrect
                          'retracted'             -- Confirmed wrong, kept for audit trail
                        )),
  verified_by         TEXT,
  verified_at         TIMESTAMPTZ,
  -- Contributor (hashed for privacy, null if admin-seeded)
  contributor_hash    TEXT,
  -- Dispute handling
  dispute_count       INTEGER NOT NULL DEFAULT 0,
  dispute_reason      TEXT,
  -- Audit trail: tags are never hard-deleted
  is_visible          BOOLEAN NOT NULL DEFAULT TRUE,  -- Hidden if retracted/severely disputed
  retraction_reason   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate tags from same contributor for same event+company
  UNIQUE (event_id, company_id, tag_type, contributor_hash)
);

CREATE INDEX tags_event_idx ON event_company_tags (event_id);
CREATE INDEX tags_company_idx ON event_company_tags (company_id);
CREATE INDEX tags_status_idx ON event_company_tags (verification_status);

-- ============================================================
-- TAG DISPUTES TABLE
-- Every dispute is logged with reasoning. Public audit trail.
-- ============================================================
CREATE TABLE tag_disputes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id              UUID NOT NULL REFERENCES event_company_tags(id) ON DELETE CASCADE,
  dispute_reason      TEXT NOT NULL CHECK (length(dispute_reason) >= 20), -- Force substance
  counter_source_id   UUID REFERENCES sources(id), -- Source supporting the dispute
  disputed_by_hash    TEXT,              -- Hashed identifier of disputer
  resolved            BOOLEAN NOT NULL DEFAULT FALSE,
  resolution_note     TEXT,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EDUCATION ARTICLES TABLE
-- Content for the Learn section
-- ============================================================
CREATE TABLE education_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,           -- 1-2 sentence summary for cards
  content         TEXT NOT NULL,           -- Markdown content
  reading_level   TEXT NOT NULL DEFAULT 'secondary' CHECK (reading_level IN (
                    'primary', 'secondary', 'university', 'expert'
                  )),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  sources         UUID[] NOT NULL DEFAULT '{}', -- Array of source IDs cited
  published       BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Events with their best-verified company tag
CREATE VIEW events_with_companies AS
SELECT
  e.id,
  e.gfw_alert_id,
  e.detected_at,
  e.area_ha,
  e.state,
  e.coordinates,
  e.forest_type,
  e.alert_type,
  e.confidence,
  e.co2_tonnes_est,
  e.is_disputed,
  t.id AS tag_id,
  t.tag_type,
  t.verification_status AS tag_status,
  c.id AS company_id,
  c.name AS company_name,
  c.sector AS company_sector,
  c.is_publicly_listed,
  c.stock_ticker,
  s.title AS source_title,
  s.url AS source_url,
  s.reliability_tier
FROM forest_events e
LEFT JOIN event_company_tags t
  ON t.event_id = e.id
  AND t.is_visible = TRUE
  AND t.verification_status != 'retracted'
LEFT JOIN companies c ON c.id = t.company_id
LEFT JOIN sources s ON s.id = t.source_id
ORDER BY e.detected_at DESC;

-- Company deforestation summary
CREATE VIEW company_deforestation_summary AS
SELECT
  c.id,
  c.name,
  c.sector,
  c.stock_ticker,
  COUNT(DISTINCT t.event_id) AS total_events_linked,
  SUM(e.area_ha) AS total_area_ha,
  SUM(e.co2_tonnes_est) AS total_co2_est,
  COUNT(DISTINCT CASE WHEN t.verification_status = 'admin_verified' THEN t.id END) AS verified_tags,
  COUNT(DISTINCT CASE WHEN t.verification_status = 'disputed' THEN t.id END) AS disputed_tags,
  MIN(e.detected_at) AS first_event_date,
  MAX(e.detected_at) AS last_event_date
FROM companies c
LEFT JOIN event_company_tags t ON t.company_id = c.id AND t.is_visible = TRUE
LEFT JOIN forest_events e ON e.id = t.event_id
GROUP BY c.id, c.name, c.sector, c.stock_ticker;
