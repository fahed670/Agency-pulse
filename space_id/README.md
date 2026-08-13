# Space ID

Space ID is a cross-platform mobile application for identifying, creating, locating, and interacting with physical spaces.

## Mobile architecture

- Flutter + Dart for the shared Android/iOS application layer.
- Native device capabilities are consumed through platform APIs rather than reimplemented.
- iOS: ARKit and system location/camera/sensor services where required.
- Android: ARCore and system location/camera/sensor services where required.

## Principle

If the phone already provides a capability, Space ID consumes that capability. Space ID code is reserved for Space ID-specific product logic, data, workflows, and user experience.

## Repository structure

- `mobile/` — Flutter application.
- `backend/` — Space ID server-side services and APIs.
- `docs/` — product and technical decisions.
