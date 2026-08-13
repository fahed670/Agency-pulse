# Space ID — Development Status

This is the simple project tracker for Space ID. It is written for product follow-up, not for developers.

## Current position

**Stage:** Core Space creation + local exploration + Space management

**Working now:**
- Flutter application structure for Android/iOS
- Space ID home screen
- Scan Space screen
- Phone camera preview
- Photo capture
- Device location permission and current location retrieval
- Creation of a real local Space record
- Automatic Space ID generation
- Local persistence of Space records on the device
- Explore Spaces screen
- Space details screen
- Local Space deletion

## What is next

1. Connect Space records to the shared backend.
2. Add the shared Space database and synchronization.
3. Add map/explore using the device location and map service.
4. Add physical-space identification and matching.
5. Add AR-based placement/visualization using the phone's native AR capability.
6. Add Space ownership and management.
7. Add advertising inventory and campaign logic.
8. Add impression/event recording.
9. Add revenue and renewal rules.

## Functional checklist

| Function | Status |
|---|---|
| App launches | DONE |
| Home screen | DONE |
| Open camera | DONE |
| Capture image | DONE |
| Read device location | DONE |
| Create Space record | DONE (local) |
| Generate Space ID | DONE (local) |
| Save Space | DONE (local) |
| Retrieve Space | DONE (local) |
| Explore Spaces | DONE (local) |
| Space details | DONE (local) |
| Delete local Space | DONE |
| Shared backend | NEXT |
| Shared Space database | NEXT |
| Synchronization | NEXT |
| Map view | NEXT |
| Physical-space matching | NEXT |
| AR experience | NEXT |
| Space ownership | NEXT |
| Advertising inventory | NEXT |
| Campaign management | NEXT |
| Impression/event tracking | NEXT |
| Revenue calculation | NEXT |
| Renewal management | NEXT |

## Important distinction

A local Space is now a real application record, but it is not yet a globally shared Space. The next backend step will make Space IDs available across devices and users.

## Architecture rule

If the phone already provides a capability, Space ID uses the phone's capability through the appropriate platform API. We do not recreate camera, GPS, sensors, AR, media playback, or notification infrastructure unless Space ID-specific logic is required.

## How to follow the project

- `space_id/STATUS.md` — this page: what works and what remains.
- `space_id/README.md` — project architecture and principles.
- `mobile/` — the actual Flutter application.

The development branch is `space-id-build`. The main branch is not the working development branch yet.
