# Space ID — Development Status

This is the simple project tracker for Space ID. It is written for product follow-up, not for developers.

## Product definition

Space ID gives a physical place, surface, structure or area a persistent digital identity. The camera is a core interface for both creating a Space and reading an existing Space.

## Current position

**Stage:** Mobile foundation + offline-first local lifecycle + shared API synchronization + PostgreSQL/PostGIS integration + geographic discovery

## Working now

- Flutter application structure for Android/iOS
- Space ID home screen
- Create Space camera flow
- Read Space camera flow using a Space ID marker/QR as the first reliable resolver
- Photo capture
- Device location permission and current location retrieval
- Automatic Space ID generation
- Local persistence of Space records
- Space content model
- Explore Spaces screen
- Space details screen
- Local Space deletion
- Shared backend API contract
- Mobile API client
- Offline-first Space creation: local save first, then shared synchronization attempt
- Shared Space retrieval from the API with local fallback
- `SPACE_READ` event submission from the mobile reader
- API development seed Space (`SP-DEMO-001`)
- Development event inspection endpoint
- PostgreSQL/PostGIS connection layer in the backend
- Local Docker PostGIS environment with schema and seed initialization
- PostGIS nearby-space query when a database is connected
- PostgreSQL persistence for Space records and events when a database is connected
- Nearby Spaces mobile experience using device location + shared nearby API
- Cross-platform geographic map view for nearby Spaces
- OpenAPI contract for the shared API
- PostgreSQL/PostGIS canonical schema for Spaces, content and events
- Development seed data
- Product specifications in `space_id/SPECIFICATIONS.md`
- Human-readable build log in `space_id/BUILD_LOG.md`

## Core camera responsibility

The camera has two distinct jobs:

1. **Create/register a Space** — capture the physical space and collect device location so a Space can be created.
2. **Read a Space** — identify a Space already registered, retrieve its digital contents, and present those contents.

The current Read Space implementation establishes the end-to-end interaction using a machine-readable Space ID marker. This is a reliable first resolver; physical visual/AR matching remains a separate recognition layer to be connected to the same Space resolution contract.

Target relationship:

**physical view → resolver → Space ID → Space record → current contents → event**

## Functional checklist

| Function | Status |
|---|---|
| App launches | DONE |
| Home screen | DONE |
| Create Space entry | DONE |
| Read Space entry | DONE |
| Open camera | DONE |
| Capture image | DONE |
| Read device location | DONE |
| Create local Space record | DONE |
| Generate Space ID | DONE |
| Save Space locally | DONE |
| Shared Space API client | DONE |
| Synchronize created Space | DONE (development API) |
| Retrieve shared Space | DONE (development API) |
| Offline local fallback | DONE |
| Space content model | DONE |
| Read Space via marker/QR | DONE |
| Record `SPACE_READ` event | DONE (development API) |
| Display shared/local Space contents | DONE |
| Explore Spaces | DONE (local) |
| Space details | DONE (local) |
| Delete local Space | DONE |
| Shared backend API contract | DONE |
| Canonical PostGIS data model | DONE |
| PostgreSQL connection layer | DONE |
| Local PostGIS Docker environment | DONE |
| PostgreSQL persistence path | DONE (when DATABASE_URL is configured) |
| PostGIS nearby query | DONE (when database is connected) |
| Nearby Spaces API experience | DONE |
| Geographic map | DONE (development map) |
| Production database deployment | BLOCKED: no production database/credentials supplied |
| Production mobile/backend synchronization | BLOCKED by production database deployment |
| Physical visual Space matching | NEXT |
| AR experience | NEXT |
| Space ownership | NEXT |
| Space lifecycle/approval | NEXT |
| Advertising inventory | NEXT |
| Campaign management | NEXT |
| Deterministic ad decision engine | NEXT |
| Image/video content intelligence | NEXT |
| Impression/event persistence in production DB | NEXT |
| Revenue calculation | NEXT |
| Renewal management | NEXT |
| Long-term analytics | NEXT |
| Demand/market intelligence | NEXT |

## Architecture rule

If the phone already provides a capability, Space ID uses the phone's capability through the appropriate platform API. We do not recreate camera, GPS, sensors, AR, media playback, or notification infrastructure unless Space ID-specific logic is required.

## Database boundary

The backend now contains a real PostgreSQL/PostGIS integration path. A local PostGIS instance can be started through `space_id/backend/docker-compose.yml`; `schema.sql` and `seed.sql` initialize it. The backend uses PostgreSQL automatically when `DATABASE_URL` is present and healthy, and otherwise retains the in-memory fallback for development.

The remaining infrastructure dependency is a durable production database deployment and its secure connection settings. Those cannot be invented inside the repository.

## Geographic discovery boundary

The mobile app now uses the device's location capability, calls the shared nearby-Spaces API, and renders the returned Spaces on a cross-platform map. The map is a development discovery surface; it does not yet perform physical visual recognition of a Space.

## How to follow the project

- `space_id/STATUS.md` — this page: what works and what remains.
- `space_id/SPECIFICATIONS.md` — complete product specifications and feature definition.
- `space_id/BUILD_LOG.md` — implementation record.
- `space_id/backend/openapi.yaml` — shared API contract.
- `space_id/backend/schema.sql` — canonical spatial database model.
- `space_id/backend/seed.sql` — development sample data.
- `space_id/backend/docker-compose.yml` — local PostGIS environment.
- `mobile/` — actual Flutter application.

The development branch is `space-id-build`. The main branch is not the working development branch yet.
