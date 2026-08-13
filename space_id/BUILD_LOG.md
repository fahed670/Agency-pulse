# Space ID — Build Log

This file is the human-readable record of implementation work on the `space-id-build` branch.

## Current build target

Build the complete Space ID product described in `SPECIFICATIONS.md`, not merely the local prototype.

## Implementation rule

Use capabilities already provided by the phone whenever possible. Space ID implements product-specific identity, spatial logic, content, business rules, events, and commercial logic rather than recreating camera/GPS/AR/media infrastructure.

## Completed implementation blocks

### 1. Mobile foundation

- Flutter/Dart cross-platform mobile application structure.
- Home screen and primary Space actions.
- Camera preview and image capture.
- Device location retrieval and permission handling.
- Automatic Space ID generation.
- Local Space persistence.
- Space listing, details and local deletion.

### 2. Shared API boundary

- OpenAPI contract for health, Space retrieval, nearby discovery, Space creation and events.
- Executable TypeScript/Express development backend.
- Development seed Space `SP-DEMO-001`.
- Development event storage and inspection endpoint.
- Development nearby-distance calculation.
- Explicit distinction between development memory storage and the planned production PostGIS store.

### 3. Mobile/shared synchronization

- Added a dedicated Flutter `SpaceApiService`.
- Space creation now follows an offline-first sequence: save locally first, then attempt shared synchronization.
- Shared synchronization failure does not destroy the locally created Space.
- Read-Space now resolves through the shared API first and falls back to the local Space copy when offline.
- Successful Space reads submit a `SPACE_READ` event to the shared service.
- API base URL is configurable through `SPACE_API_BASE_URL`.

### 4. Spatial data foundation

- PostgreSQL/PostGIS canonical schema exists in the repository.
- Development seed SQL exists.
- Production database connection remains intentionally unclaimed until a real database deployment and migration path are available.

## Current implementation boundary

The mobile application and development API now have a real end-to-end shared Space flow. The remaining infrastructure boundary is persistence in a deployed PostgreSQL/PostGIS database.

## Next implementation blocks

1. Production PostgreSQL/PostGIS deployment and migration execution.
2. Replace development in-memory repository with the production spatial repository.
3. Geographic discovery/map experience.
4. Canonical Space ownership and lifecycle/approval.
5. Content management.
6. Advertising inventory and campaign model.
7. Deterministic ad decisioning.
8. Durable event collection and revenue records.
9. Recognition/AR integration.
10. Analytics and market intelligence interfaces.

## Definition of done

A capability is marked DONE only when the corresponding product behavior is implemented, connected to the appropriate data/service boundary, and represented in the application flow. Documentation alone does not count as implementation.
