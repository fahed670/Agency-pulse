# Space ID — Public Person Discovery

## Purpose

Space ID can identify and expose the public digital identity of a person or personality who explicitly wants to be discoverable through the Space ID network.

This extends Space ID beyond advertising surfaces: a physical view can resolve to a public person profile when the person has opted into discovery and the recognition system has a valid authorized reference.

## User experience

**Camera → candidate visual match → authorized public identity → person profile → permitted contact/social channels**

The profile may contain:

- Public display name.
- Profile image.
- Short biography.
- Public social-media links.
- Public contact methods.
- Public professional links.
- Spaces where the person has chosen to be discoverable.
- Public content or media.

## Discovery modes

### 1. Explicit marker

The most reliable first implementation is a Space/person marker or QR that resolves to a person profile. This is deterministic and does not require biometric inference.

### 2. Opt-in visual recognition

A visual recognition layer can match a camera view against an enrolled person only when:

- The person has explicitly enabled public discovery.
- The recognition purpose and scope have been accepted.
- A protected recognition reference exists.
- The match meets the configured confidence and policy thresholds.

### 3. Contextual Space matching

A person can be linked to a Space or event so that the camera can resolve the public identity from the physical context without identifying arbitrary people in the environment.

## What the system must not do

- Do not identify arbitrary bystanders who have not enrolled.
- Do not expose a person's phone number, email, or social accounts unless those fields are explicitly marked public.
- Do not create a public profile merely because a face appears in a camera frame.
- Do not store raw face images as the production recognition database.
- Do not treat an AI visual guess as authoritative identity.

## Identity result

A recognition result is a candidate until policy and authorization checks pass. The authoritative identity is the enrolled Space ID/person record, not the model's prediction.

## Revocation

A person must be able to disable public discovery and revoke recognition authorization. Revocation prevents new discovery and deactivates the associated recognition reference according to the applicable retention policy.

## Architecture

The person identity layer is separate from the Space commercial layer but can link a person to one or more Spaces. The same event system records discovery and profile-open events without unnecessarily storing raw camera imagery.
