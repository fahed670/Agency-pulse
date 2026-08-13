# Space ID — Simple Follow-up Guide

## Where to look

Open the repository on GitHub and select the `space-id-build` branch.

Then open the `space_id` folder.

### 1. STATUS.md
This is the main page to follow. It answers:
- What works?
- What are we building next?
- What remains?

### 2. README.md
This explains the technical direction at a high level.

### 3. mobile/
This is the actual mobile application source.

## Important

You do not need to understand the source code to follow the project. Use `STATUS.md` as the project dashboard.

When a function becomes genuinely usable, its status should move from `NEXT` to `DONE`. Writing code alone does not count as completion.

## Current test flow

The current implemented flow is:

Home → Scan Space → Camera → Capture → Read phone location → Show capture result.

The capture result is still temporary. It is not yet a permanent Space record.
