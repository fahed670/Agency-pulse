ALTER TABLE spaces
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT,
  ADD COLUMN IF NOT EXISTS space_type TEXT NOT NULL DEFAULT 'POINT',
  ADD COLUMN IF NOT EXISTS geometry GEOGRAPHY(GEOMETRY, 4326),
  ADD COLUMN IF NOT EXISTS annual_fee_cents INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS term_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS term_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_status TEXT NOT NULL DEFAULT 'NOT_DUE';

CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_term ON spaces(term_expires_at);
CREATE INDEX IF NOT EXISTS idx_spaces_geometry ON spaces USING GIST(geometry);

CREATE TABLE IF NOT EXISTS space_revenue_entitlements (
  id BIGSERIAL PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL,
  term_year INTEGER NOT NULL,
  owner_share_bps INTEGER NOT NULL,
  platform_share_bps INTEGER NOT NULL,
  qualified_revenue_cents BIGINT NOT NULL DEFAULT 0,
  owner_revenue_cents BIGINT NOT NULL DEFAULT 0,
  platform_revenue_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(space_id, term_year)
);

CREATE TABLE IF NOT EXISTS qualified_impressions (
  id BIGSERIAL PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  qualification_method TEXT NOT NULL,
  source_event_id BIGINT REFERENCES space_events(id),
  billable_value_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'QUALIFIED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qualified_impressions_space_time
  ON qualified_impressions(space_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_qualified_impressions_campaign_time
  ON qualified_impressions(campaign_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS commercial_listings (
  id BIGSERIAL PRIMARY KEY,
  space_id TEXT REFERENCES spaces(id) ON DELETE SET NULL,
  owner_user_id TEXT NOT NULL,
  listing_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contact_phone TEXT,
  contact_url TEXT,
  price_cents BIGINT,
  currency TEXT NOT NULL DEFAULT 'AED',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commercial_listings_space
  ON commercial_listings(space_id, status);
