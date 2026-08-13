# Space ID — Development Status

This is the simple project tracker for Space ID. It is written for product follow-up, not for developers.

## Product definition

Space ID gives a physical place, surface, structure or area a persistent digital identity. The camera is a core interface for both creating a Space and reading an existing Space.

## Current position

**Stage:** Core Space creation + local exploration + Space management + product specification baseline

## Working now

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
- Product specifications and complete feature definition in `space_id/SPECIFICATIONS.md`

## Core camera responsibility

The camera has **two distinct jobs** in Space ID:

1. **Create/register a Space** — capture the physical space and collect the device location so a Space can be created.
2. **Read a Space** — look at a physical Space that already has a Space ID, identify which Space it corresponds to, retrieve its digital contents, and present those contents to the user.

Reading a Space is a core Space ID function. The target relationship is:

**physical view → Space ID → Space record → contents associated with that Space**

Contents may include information, images, video, offers, advertisements, links/actions, or other digital experiences assigned to the Space.

## Product capabilities defined

- Space identity and lifecycle
- Space creation and registration
- Camera-based Space reading/discovery
- Physical-space recognition and matching
- Space content container
- Geographic discovery and map
- Space ownership and management
- Advertising inventory
- Campaign management
- Deterministic ad decision engine
- Image/video content understanding and adaptation
- Event tracking
- Performance and revenue data
- Market and demand analytics
- Privacy by Design
- Native-device capability integration
- AR presentation when appropriate
- Global geographic hierarchy: World → Country → Emirate/State → City → District → Building → Space

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
| Product specifications | DONE |
| Shared backend | NEXT |
| Shared Space database | NEXT |
| Synchronization | NEXT |
| Read Space with camera | NEXT |
| Resolve physical Space to Space ID | NEXT |
| Retrieve Space contents | NEXT |
| Display Space contents | NEXT |
| Map view | NEXT |
| Physical-space matching | NEXT |
| AR experience | NEXT |
| Space ownership | NEXT |
| Advertising inventory | NEXT |
| Campaign management | NEXT |
| Deterministic ad decision engine | NEXT |
| Image/video content intelligence | NEXT |
| Impression/event tracking | NEXT |
| Revenue calculation | NEXT |
| Renewal management | NEXT |
| Long-term analytics | NEXT |
| Demand/market intelligence | NEXT |

## Architecture rule

If the phone already provides a capability, Space ID uses the phone's capability through the appropriate platform API. We do not recreate camera, GPS, sensors, AR, media playback, or notification infrastructure unless Space ID-specific logic is required.

## Source of product definition

The complete product definition is based on the Space ID specification supplied in this conversation. The source establishes the core architecture around camera/AR, spatial understanding, PostGIS, geographic search, AI vision, advertising decisioning, event infrastructure, analytics, privacy, global geographic hierarchy and data-driven market intelligence.

## How to follow the project

- `space_id/STATUS.md` — this page: what works and what remains.
- `space_id/SPECIFICATIONS.md` — the complete product specifications and feature definition.
- `space_id/README.md` — project architecture and principles.
- `mobile/` — the actual Flutter application.

The development branch is `space-id-build`. The main branch is not the working development branch yet.
