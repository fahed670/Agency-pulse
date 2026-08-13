# Space ID — Development Status

This page is the simple project tracker for Space ID. It is written for product follow-up, not for developers.

## Current position

**Stage:** Foundation + first working device flow

**Working now:**
- Flutter application structure for Android/iOS
- Space ID home screen
- Scan Space screen
- Phone camera preview
- Photo capture
- Device location permission and current location retrieval
- Capture result showing image path and latitude/longitude/accuracy

## What is next

1. Convert a capture into a real Space record.
2. Generate a permanent Space ID.
3. Store and retrieve Space records.
4. Add the map/explore experience.
5. Add physical-space identification and matching.
6. Add AR-based placement/visualization using the phone's native AR capability.
7. Add Space ownership and management.
8. Add advertising inventory and campaign logic.
9. Add impression/event recording.
10. Add revenue and renewal rules.

## Functional checklist

| Function | Status |
|---|---|
| App launches | DONE |
| Home screen | DONE |
| Open camera | DONE |
| Capture image | DONE |
| Read device location | DONE |
| Combine capture + location | DONE (temporary capture result) |
| Create persistent Space | NEXT |
| Generate Space ID | NEXT |
| Save Space | NEXT |
| Retrieve Space | NEXT |
| Explore Spaces | NEXT |
| Map view | NEXT |
| Physical-space matching | NEXT |
| AR experience | NEXT |
| Space ownership | NEXT |
| Advertising inventory | NEXT |
| Campaign management | NEXT |
| Impression/event tracking | NEXT |
| Revenue calculation | NEXT |
| Renewal management | NEXT |

## Architecture rule

If the phone already provides a capability, Space ID uses the phone's capability through the appropriate platform API. We do not recreate camera, GPS, sensors, AR, media playback, or notification infrastructure unless Space ID-specific logic is required.

## How to follow the project

- `space_id/STATUS.md` — this page: what works and what remains.
- `space_id/README.md` — project architecture and principles.
- `mobile/` — the actual Flutter application.

The development branch is `space-id-build`. The main branch is not the working development branch yet.
