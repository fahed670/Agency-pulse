-- Public Person / Personality identity layer for Space ID.
-- This layer is opt-in: a person is discoverable only after creating/approving a public identity profile.
-- Face templates are sensitive biometric data and must never be inferred from arbitrary bystanders.

CREATE TABLE IF NOT EXISTS public_person_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'PERSON',
  bio TEXT,
  profile_image_reference TEXT,
  public_discovery_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  contact_visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  social_visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public_person_contacts (
  id BIGSERIAL PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES public_person_profiles(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public_person_social_links (
  id BIGSERIAL PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES public_person_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public_person_space_links (
  person_id TEXT NOT NULL REFERENCES public_person_profiles(id) ON DELETE CASCADE,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'APPEARS_IN',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (person_id, space_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS public_person_recognition_consent (
  person_id TEXT PRIMARY KEY REFERENCES public_person_profiles(id) ON DELETE CASCADE,
  consent_scope TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  policy_version TEXT NOT NULL
);

-- Recognition references are deliberately separated from public profile data.
-- A production implementation must store only a protected reference to a biometric
-- representation in a dedicated service, never raw face images in this table.
CREATE TABLE IF NOT EXISTS public_person_recognition_reference (
  person_id TEXT PRIMARY KEY REFERENCES public_person_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  template_reference TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_person_discovery ON public_person_profiles(public_discovery_enabled, status);
CREATE INDEX IF NOT EXISTS idx_person_space ON public_person_space_links(space_id, status);
CREATE INDEX IF NOT EXISTS idx_person_social_public ON public_person_social_links(person_id, is_public);
CREATE INDEX IF NOT EXISTS idx_person_contacts_public ON public_person_contacts(person_id, is_public);
