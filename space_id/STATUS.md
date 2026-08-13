# Space ID — Development Status

This is the simple project tracker for Space ID. It is written for product follow-up, not for developers.

## Product definition

Space ID gives a physical place, surface, structure or area a persistent digital identity. The camera is a core interface for both creating a Space and reading an existing Space.

## Current position

**Stage:** Mobile foundation + local Space lifecycle + shared API contract + canonical spatial data model

## Working now

- Flutter application structure for Android/iOS
- Space ID home screen
- Create Space camera flow
- Read Space camera flow using a Space ID marker/QR as the first reliable resolver
- Photo capture
- Device location permission and current location retrieval
- Creation of a local Space record
- Automatic Space ID generation
- Local persistence of Space records
- Space content model
- Explore Spaces screen
- Space details screen
- Local Space deletion
- Shared backend API boundary
- Initial Space API service contract (`/health`, `/spaces`, `/spaces/:spaceId`, `/spaces/nearby`, `/events`)
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

**physical view → resolver → Space ID → Space record → current contents**

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
| Create Space record | DONE (local) |
| Generate Space ID | DONE (local) |
| Save Space | DONE (local) |
| Retrieve Space | DONE (local) |
| Space content model | DONE |
| Read Space via marker/QR | DONE (local resolver) |
| Display local Space contents | DONE |
| Explore Spaces | DONE (local) |
| Space details | DONE (local) |
| Delete local Space | DONE |
| Product specifications | DONE |
| Build tracking | DONE |
| Shared backend API contract | DONE |
| Canonical PostGIS data model | DONE |
| Shared production database connection | NEXT |
| Mobile/backend synchronization | NEXT |
| Canonical shared Space creation | NEXT |
| Canonical Space content retrieval | NEXT |
| Geographic map | NEXT |
| Physical visual Space matching | NEXT |
| AR experience | NEXT |
| Space ownership | NEXT |
| Space lifecycle/approval | NEXT |
| Advertising inventory | NEXT |
| Campaign management | NEXT |
| Deterministic ad decision engine | NEXT |
| Image/video content intelligence | NEXT |
| Impression/event persistence | NEXT |
| Revenue calculation | NEXT |
| Renewal management | NEXT |
| Long-term analytics | NEXT |
| Demand/market intelligence | NEXT |

## Architecture rule

If the phone already provides a capability, Space ID uses the phone's capability through the appropriate platform API. We do not recreate camera, GPS, sensors, AR, media playback, or notification infrastructure unless Space ID-specific logic is required.

## Important implementation boundary

The API contract and spatial schema are now defined, but the production database is not claimed as connected until a real database deployment and migration path are wired and tested. The SQL model uses PostgreSQL + PostGIS because Space ID's geographic operations require spatial data support.

## How to follow the project

- `space_id/STATUS.md` — this page: what works and what remains.
- `space_id/SPECIFICATIONS.md` — complete product specifications and feature definition.
- `space_id/BUILD_LOG.md` — implementation record.
- `space_id/backend/openapi.yaml` — shared API contract.
- `space_id/backend/schema.sql` — canonical spatial database model.
- `space_id/backend/seed.sql` — development sample data.
- `mobile/` — actual Flutter application.

The development branch is `space-id-build`. The main branch is not the working development branch yet.
