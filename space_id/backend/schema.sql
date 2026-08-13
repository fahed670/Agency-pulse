-- Space ID canonical relational model.
-- Spatial columns are designed for PostgreSQL + PostGIS.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_meters DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS
    (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) STORED,
  image_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spaces_location ON spaces USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);

CREATE TABLE IF NOT EXISTS space_contents (
  id BIGSERIAL PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  media_reference TEXT,
  target_url TEXT,
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  sort_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_contents_space ON space_contents(space_id, status, sort_order);

CREATE TABLE IF NOT EXISTS space_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  session_id TEXT,
  device_id TEXT,
  content_version INTEGER,
  campaign_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_events_space_time ON space_events(space_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_space_events_type_time ON space_events(event_type, occurred_at DESC);

-- Canonical nearby query used by the mobile/backend contract:
-- SELECT * FROM spaces
-- WHERE status = 'ACTIVE'
--   AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius_meters);
