-- ============================================================
-- MYHUTAN Row Level Security — Migration 002
-- Public reads on most tables.
-- Writes require authentication + moderation role for sensitive ops.
-- ============================================================

ALTER TABLE sources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE forest_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_concessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_company_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_disputes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_articles   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES
-- Anyone can read verified, visible data — no login required
-- ============================================================

CREATE POLICY "public_read_sources"
  ON sources FOR SELECT TO anon USING (true);

CREATE POLICY "public_read_events"
  ON forest_events FOR SELECT TO anon USING (true);

CREATE POLICY "public_read_companies"
  ON companies FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "public_read_concessions"
  ON company_concessions FOR SELECT TO anon
  USING (verification_status != 'retracted');

CREATE POLICY "public_read_tags"
  ON event_company_tags FOR SELECT TO anon
  USING (is_visible = true AND verification_status != 'retracted');

CREATE POLICY "public_read_disputes"
  ON tag_disputes FOR SELECT TO anon USING (true);

CREATE POLICY "public_read_articles"
  ON education_articles FOR SELECT TO anon USING (published = true);

-- ============================================================
-- AUTHENTICATED USER POLICIES
-- Logged-in users can submit community tags and disputes
-- ============================================================

-- Authenticated users can insert sources (for community tags)
CREATE POLICY "auth_insert_sources"
  ON sources FOR INSERT TO authenticated
  WITH CHECK (source_type IN ('community', 'news', 'ngo_report'));

-- Authenticated users can submit tags (community_unverified only)
CREATE POLICY "auth_insert_tags"
  ON event_company_tags FOR INSERT TO authenticated
  WITH CHECK (
    verification_status = 'community_unverified'
    AND contributor_hash IS NOT NULL
  );

-- Authenticated users can submit disputes
CREATE POLICY "auth_insert_disputes"
  ON tag_disputes FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- MODERATOR POLICIES (role: moderator)
-- Moderators can verify, retract, and manage all records
-- ============================================================

CREATE POLICY "moderator_all_sources"
  ON sources FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "moderator_all_events"
  ON forest_events FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "moderator_all_companies"
  ON companies FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "moderator_all_concessions"
  ON company_concessions FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "moderator_all_tags"
  ON event_company_tags FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');

CREATE POLICY "moderator_resolve_disputes"
  ON tag_disputes FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'moderator');
