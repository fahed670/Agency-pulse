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

## Core camera responsibility

The camera has **two distinct jobs** in Space ID:

1. **Create/register a Space** — capture the physical space and collect the device location so a Space can be created.
2. **Read a Space** — look at a physical Space that already has a Space ID, identify which Space it corresponds to, retrieve its digital contents, and present those contents to the user.

The second capability is a core Space ID function, not an optional camera feature. The camera is therefore an input for both **Space creation** and **Space discovery/reading**.

Reading a Space means that the app does not merely recognize an image. It must ultimately establish the relationship:

**physical view → Space ID → Space record → contents associated with that Space**

The contents may include the information, media, offers, advertisements, or other digital experiences assigned to that Space.

## What is next

1. Connect Space records to the shared backend.
2. Add the shared Space database and synchronization.
3. Build the camera-based **Read Space** flow: recognize a physical Space, resolve its Space ID, retrieve its contents, and display them.
4. Add map/explore using the device location and map service.
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
| Create Space record | DONE (local) |
| Generate Space ID | DONE (local) |
| Save Space | DONE (local) |
| Retrieve Space | DONE (local) |
| Explore Spaces | DONE (local) |
| Space details | DONE (local) |
| Delete local Space | DONE |
| Shared backend | NEXT |
| Shared Space database | NEXT |
| Read Space with camera | NEXT |
| Resolve physical Space to Space ID | NEXT |
| Retrieve Space contents | NEXT |
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
