# Space ID — Multi-Campaign Ad Inventory & Eligible Impression Rules

## Purpose

A Space is an advertising inventory unit, not a single advertisement.

One Space can host many eligible campaigns at the same time. Example campaigns can include a restaurant, bank, real estate project, retailer, and event.

The system selects an eligible campaign for each read/render opportunity according to deterministic rules. Selection must not be purely random.

## Core model

**One Space → many campaigns → eligibility filtering → decision engine → selected ad → qualified impression → revenue allocation**

The same Space can therefore generate revenue from many advertisers over the same period, subject to inventory, campaign, frequency, and measurement rules.

## Eligibility inputs

The decision engine can evaluate:

- Prior exposure count for the user/device/session where lawful and available.
- Campaign objective progress.
- Target audience eligibility.
- Time/daypart.
- User location and Space location.
- Remaining campaign budget.
- Campaign priority.
- Frequency/cooldown rules.
- Space-owner category restrictions.
- Campaign status and schedule.
- Impression limits.
- Purchase/reservation conditions.
- Content availability and approval state.

## Selection principle

The engine first removes campaigns that are not eligible. It then ranks the remaining eligible campaigns using deterministic business rules and selects the winning campaign.

Randomization may be used only as a controlled tie-breaker or experiment mechanism when explicitly configured. It must not replace eligibility, pacing, budget, frequency, or owner rules.

## Example

A user reads the same Space at 10:00 and receives Campaign A.

The user reads the same Space again an hour later. If A is inside its cooldown/frequency rule, another eligible campaign such as B can win.

The next day, C can win if it is eligible and ranked highest at that time.

The Space therefore behaves as a continuously allocated inventory unit rather than a static billboard.

## Qualified impression

Opening the camera, entering the Space page, or merely generating a recognition request is **not** automatically an advertising impression.

A qualified impression requires a complete measurement chain:

1. A valid Space is resolved.
2. An eligible campaign is selected.
3. The ad payload/version is successfully delivered.
4. The client reports the required render/view signal.
5. The event passes anti-duplication and measurement validation.
6. The event is accepted as a qualified impression.

The exact view threshold can be configured by product rules for each media type, but must be deterministic and auditable.

## Anti-abuse / duplicate protection

The measurement layer must prevent a user from generating hundreds of billable impressions by repeatedly pointing the camera at the same Space within seconds.

Controls include:

- User/device/session frequency caps where lawful and appropriate.
- Per-user/per-device cooldowns.
- Space-level velocity limits.
- Campaign-level frequency rules.
- Duplicate-event/idempotency keys.
- Suspicious repeated-event detection.
- Server-side validation before revenue is finalized.
- Separation of raw events from accepted billable impressions.

A raw camera/read event is not revenue.

## Revenue model

The economic model supports the principle that the Space owner receives **70%** of the value of eligible advertising activity attributed to the Space during the applicable entitlement period, while the platform retains **30%**, subject to the contractual rules of the Space program.

The revenue ledger must therefore be based on **accepted qualified impressions/events**, not camera opens or unvalidated client claims.

## Required records

For each candidate selection, the system should be able to explain:

- Space ID.
- Campaign ID.
- Selection timestamp.
- Eligibility result.
- Winning/ranking reason.
- User/device/session frequency state where lawful.
- Budget/pacing state.
- Render/view result.
- Qualified-impression decision.
- Revenue amount.
- Owner share.
- Platform share.

## Product consequence

The advertising architecture is an exchange-like allocation layer over Space inventory:

**Advertisers purchase demand → campaigns express eligibility → Space ID supplies inventory → decision engine allocates opportunities → measurement validates delivery → revenue is attributed to the Space.**

This is a core product capability, not an optional advertising screen.
