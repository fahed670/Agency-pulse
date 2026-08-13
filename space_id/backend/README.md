# Space ID Backend

The backend is the shared system boundary for Space ID. It is intentionally kept separate from the Flutter mobile application.

## Responsibilities

- Persist the canonical Space record.
- Provide Space lookup by ID.
- Provide nearby/geographic Space discovery.
- Store Space content references.
- Provide ownership/lifecycle boundaries.
- Accept operational events.
- Expose deterministic commercial decision boundaries.

## Initial API contract

### `GET /health`
Returns service health.

### `GET /spaces/:spaceId`
Returns the canonical Space and its currently published content references.

### `GET /spaces/nearby?lat=&lng=&radiusMeters=`
Returns Spaces near a coordinate.

### `POST /spaces`
Creates a Space submission from the mobile application.

### `POST /events`
Accepts a Space ID event such as `SPACE_READ`, `SPACE_CONTENT_OPENED`, or `AD_RENDERED`.

The concrete server framework and database implementation will be selected from the functional requirements rather than added speculatively.
