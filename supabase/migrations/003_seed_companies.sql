-- ============================================================
-- MYHUTAN Seed Data — Migration 003
-- Initial company records with mandatory source citations.
-- All source URLs are real, publicly accessible documents.
-- Source: Bursa Malaysia, RSPO, MPOB public databases.
-- ============================================================

-- Insert data sources first (every record requires one)
INSERT INTO sources (id, title, url, source_type, reliability_tier, publisher, published_at) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Bursa Malaysia Company Profile: FGV Holdings Berhad',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5222',
  'government_filing', 1, 'Bursa Malaysia', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Bursa Malaysia Company Profile: Sime Darby Plantation Berhad',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5285',
  'government_filing', 1, 'Bursa Malaysia', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000003',
  'RSPO Members List 2024',
  'https://rspo.org/members/',
  'ngo_report', 2, 'Roundtable on Sustainable Palm Oil', '2024-06-01'
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Bursa Malaysia: IOI Corporation Berhad',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=1961',
  'government_filing', 1, 'Bursa Malaysia', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000005',
  'Global Forest Watch — GFW Commodities: Malaysia Palm Oil Concessions',
  'https://www.globalforestwatch.org/dashboards/country/MYS/',
  'satellite_data', 1, 'World Resources Institute / Global Forest Watch', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000006',
  'Bursa Malaysia: Kuala Lumpur Kepong Berhad (KLK)',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=2445',
  'government_filing', 1, 'Bursa Malaysia', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000007',
  'Bursa Malaysia: Boustead Plantations Berhad',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5254',
  'government_filing', 1, 'Bursa Malaysia', '2024-01-01'
),
(
  'a1000000-0000-0000-0000-000000000008',
  'Sarawak Timber Association — Member Companies',
  'https://www.sta.org.my/member-companies',
  'ngo_report', 2, 'Sarawak Timber Association', '2024-01-01'
);

-- ============================================================
-- SEED COMPANIES
-- Major Malaysian palm oil and timber companies.
-- Source: Bursa Malaysia, RSPO public records.
-- ============================================================
INSERT INTO companies (id, name, name_bm, sector, is_publicly_listed, stock_ticker, exchange, bursa_filings_url, rspo_member, mspo_certified, description, website_url, verified_by, verified_at) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  'FGV Holdings Berhad',
  'FGV Holdings Berhad',
  'palm_oil', true, 'FGV', 'KLSE',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5222',
  true, true,
  'One of the world''s largest palm oil producers, managing ~1.8 million hectares under FELDA and FGV schemes across Peninsular Malaysia and Sabah.',
  'https://www.fgvholdings.com',
  'MYHUTAN team (Bursa Malaysia + RSPO records)', NOW()
),
(
  'c1000000-0000-0000-0000-000000000002',
  'Sime Darby Plantation Berhad',
  'Sime Darby Plantation Berhad',
  'palm_oil', true, 'SIMEPLT', 'KLSE',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5285',
  true, true,
  'The world''s largest listed palm oil company by planted area, with operations across Malaysia, Indonesia, Papua New Guinea, and the Solomon Islands.',
  'https://www.simedarbyplantation.com',
  'MYHUTAN team (Bursa Malaysia + RSPO records)', NOW()
),
(
  'c1000000-0000-0000-0000-000000000003',
  'IOI Corporation Berhad',
  'IOI Corporation Berhad',
  'palm_oil', true, 'IOICORP', 'KLSE',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=1961',
  true, true,
  'Major integrated palm oil company with plantations in Sabah and Sarawak. IOI has been subject to RSPO suspension proceedings in the past over deforestation allegations.',
  'https://www.ioigroup.com',
  'MYHUTAN team (Bursa Malaysia + RSPO records)', NOW()
),
(
  'c1000000-0000-0000-0000-000000000004',
  'Kuala Lumpur Kepong Berhad (KLK)',
  'Kuala Lumpur Kepong Berhad',
  'palm_oil', true, 'KLK', 'KLSE',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=2445',
  true, true,
  'Diversified palm oil and rubber plantation company with operations in Peninsular Malaysia, Sabah, and Sarawak.',
  'https://www.klk.com.my',
  'MYHUTAN team (Bursa Malaysia + RSPO records)', NOW()
),
(
  'c1000000-0000-0000-0000-000000000005',
  'Boustead Plantations Berhad',
  'Boustead Plantations Berhad',
  'palm_oil', true, 'BPLANT', 'KLSE',
  'https://www.bursamalaysia.com/trade/trading_resources/listing_directory/company-profile?stock_code=5254',
  false, true,
  'Palm oil plantation company primarily operating in Peninsular Malaysia and Sabah, majority-owned by Boustead Holdings.',
  'https://www.bousteadplantations.com.my',
  'MYHUTAN team (Bursa Malaysia records)', NOW()
);

-- Seed the GFW data source record for use in event inserts
INSERT INTO sources (id, title, url, source_type, reliability_tier, publisher, published_at) VALUES
(
  'a1000000-0000-0000-0000-000000000010',
  'Global Forest Watch GLAD-L Deforestation Alert System',
  'https://www.globalforestwatch.org/help/map/analyses/how-are-glad-alerts-classified/',
  'satellite_data', 1, 'World Resources Institute', '2024-01-01'
);

-- ============================================================
-- SAMPLE FOREST EVENTS (for development/demo)
-- These are illustrative events using approximate coordinates.
-- Production data will be fetched from GFW API.
-- ============================================================
INSERT INTO forest_events (id, gfw_alert_id, detected_at, area_ha, state, coordinates, forest_type, alert_type, confidence, data_source_id, co2_tonnes_est) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'GLAD-L-MYS-2025-001',
  '2025-10-14 00:00:00+00',
  147.3,
  'Sabah',
  ST_GeographyFromText('POINT(117.5620 5.0120)'),
  'primary', 'GLAD_L', 'high',
  'a1000000-0000-0000-0000-000000000010',
  29460.0
),
(
  'e1000000-0000-0000-0000-000000000002',
  'GLAD-L-MYS-2025-002',
  '2025-11-03 00:00:00+00',
  83.7,
  'Sarawak',
  ST_GeographyFromText('POINT(113.9800 2.1800)'),
  'peatland', 'GLAD_S2', 'high',
  'a1000000-0000-0000-0000-000000000010',
  167400.0  -- Peatland has ~20x higher carbon density
),
(
  'e1000000-0000-0000-0000-000000000003',
  'GLAD-L-MYS-2025-003',
  '2025-12-21 00:00:00+00',
  210.5,
  'Pahang',
  ST_GeographyFromText('POINT(102.9200 3.8100)'),
  'secondary', 'RADD', 'nominal',
  'a1000000-0000-0000-0000-000000000010',
  21050.0
),
(
  'e1000000-0000-0000-0000-000000000004',
  'GLAD-L-MYS-2026-001',
  '2026-01-08 00:00:00+00',
  55.2,
  'Sabah',
  ST_GeographyFromText('POINT(118.1100 4.7600)'),
  'primary', 'RADD', 'high',
  'a1000000-0000-0000-0000-000000000010',
  11040.0
),
(
  'e1000000-0000-0000-0000-000000000005',
  'GLAD-L-MYS-2026-002',
  '2026-02-15 00:00:00+00',
  320.8,
  'Sarawak',
  ST_GeographyFromText('POINT(111.4600 1.5500)'),
  'primary', 'GLAD_S2', 'high',
  'a1000000-0000-0000-0000-000000000010',
  64160.0
);

-- Sample company tag (Sabah event linked to FGV — illustrative, requires real source)
-- In production all tags must be sourced before insertion
INSERT INTO event_company_tags (event_id, company_id, source_id, tag_type, verification_status, verified_by, verified_at) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'concession_owner', 'community_unverified', NULL, NULL
);
