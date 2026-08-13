# Space ID — Architecture Decision

## Core decision

Space ID will use one shared mobile codebase with Flutter/Dart for Android and iOS.

## Device capability rule

Space ID does not recreate capabilities already supplied by the phone. The application calls platform capabilities through Flutter plugins or native platform integrations when required.

Examples:

- Camera → device camera APIs.
- Location → device location services.
- Motion/orientation → device sensors.
- AR → ARKit on iOS and ARCore on Android.
- Notifications → APNs/FCM through platform integrations.

The Space ID layer is responsible for product-specific behavior: spaces, identity, spatial records, ownership, discovery, campaigns, advertising, events, and business rules.

## Repository direction

`mobile/` contains the cross-platform Flutter application.

`backend/` is reserved for server-side Space ID services and will be introduced around concrete product requirements rather than a preselected collection of infrastructure.
