# Space ID — Product Specifications & Features

## 1. Product definition

Space ID turns a physical place, surface, structure, or area into an identifiable digital Space that can be discovered, read, managed, and used as an advertising surface.

The application has two complementary camera journeys:

1. **Create / register a Space** — capture a physical space and associate it with its location, geometry, identity, and metadata.
2. **Read / discover a Space** — point the camera at an existing Space, identify which Space ID is present, retrieve what is stored inside it, and present that content to the user.

The phone is the device capability layer. Space ID does not recreate camera, GPS, sensors, AR, or media playback when the device already provides them.

---

## 2. Core object: Space

Every physical Space is represented as a persistent Space ID.

A Space can represent:

- A point.
- A building facade.
- A polygon on a wall or surface.
- A ground area.
- Part of a physical surface.
- A corridor.
- A street.
- A bridge.
- A larger geographic area.

A Space record contains, as applicable:

- Space ID
- Owner ID
- Location
- Geometry
- Building ID
- Floor
- Orientation
- Surface Type
- Space Type
- Allowed Categories
- Status
- Created At
- Approved At
- Expiry
- Renewal Status
- Revenue
- Visual references used for identification
- Content references stored inside the Space

The underlying geometry is not limited to latitude/longitude; it represents the physical shape and spatial relationship of the Space.

---

## 3. User roles

### Space Owner

Can:

- Create/register a Space.
- Submit Space information.
- View Space details and status.
- Manage Space content/availability.
- Define permitted advertising categories where applicable.
- View performance and revenue information.
- Manage renewal status.

### Advertiser

Can:

- Search for Spaces.
- Filter Spaces geographically.
- Inspect Space characteristics.
- Create campaigns.
- Upload image or video advertising content.
- Define campaign rules, budget, geography, audience and other eligibility conditions.
- Monitor campaign delivery and performance.

### Discovering User

Can:

- Use the camera to identify a physical Space.
- Read the Space ID/content associated with that physical Space.
- View media, information, offers or advertising attached to the Space.
- Interact with available Space content.
- Explore nearby Spaces.

---

## 4. Camera functions

The camera is a core Space ID interface, not merely a capture utility.

### A. Create Space

Camera → environment understanding → location/geometry → Space record → Space ID.

### B. Read Space

Camera → detect/recognize physical Space → match against known Space IDs → retrieve Space content → display content.

The second flow is mandatory. The application must be able to use a camera view to determine whether the user is looking at a known Space and, when matched, open the digital content associated with that Space.

---

## 5. Physical-space understanding

When a Space is captured or read, Space ID should determine, where technically possible:

- What is being viewed.
- Where it is located.
- Its approximate shape.
- Its approximate dimensions.
- Its orientation.
- Its relationship to the building/street/area.
- Whether it matches an existing Space.

The solution combines the device's native AR and sensor capabilities with computer vision, geospatial matching and AI where needed.

The target flow is:

Camera → feature detection → plane/depth information when available → geometry → location/orientation → Space ID matching.

LiDAR is an enhancement when available, not a mandatory hardware dependency.

---

## 6. Reading the contents of a Space

A Space is a digital container associated with a physical location/surface. Its contents may include:

- Space information.
- Images.
- Videos.
- Advertising content.
- Offers.
- Campaign information.
- Interactive content.
- Links/actions.
- Space owner information where permitted.
- Contextual metadata.

The read experience must support:

1. Detecting a Space from the camera view.
2. Matching it to the correct Space ID.
3. Retrieving the current content version.
4. Presenting content in the appropriate format.
5. Recording the relevant discovery/render/interact events.

Content may be displayed as normal mobile UI, media, or an AR experience when appropriate.

---

## 7. Space discovery and map

The application must provide a geographic discovery experience.

Users can search/filter Spaces by spatial relationships such as:

- Inside an area.
- Intersecting an area.
- Near an area.
- Inside a polygon.
- Within a specified distance of another Space.

The data model must support the hierarchy:

World → Country → Emirate/State → City → District → Building → Space.

The model must not be hard-coded to Dubai or the UAE.

---

## 8. Space matching

Space matching determines whether a camera view corresponds to a previously registered Space.

Potential signals include:

- Device location.
- Device orientation.
- Physical geometry.
- Camera features.
- Visual similarity.
- Building relationship.
- Surface characteristics.
- Existing Space metadata.

AI/vision is used to assist recognition and matching; deterministic Space rules remain authoritative for business and ownership decisions.

---

## 9. Space management

The application must support the Space lifecycle:

CREATE → SUBMIT → APPROVE → ACTIVE → EXPIRED/RENEWED

Required management capabilities include:

- View Space details.
- View current status.
- View location and geometry.
- View associated content.
- View permitted categories.
- View campaign/advertising activity.
- View revenue information where applicable.
- Renew or manage expiration state.

---

## 10. Advertising inventory

A Space can become an advertising inventory unit when it is eligible for advertising.

The inventory model must understand:

- Space characteristics.
- Owner restrictions.
- Allowed categories.
- Location.
- Availability.
- Campaign eligibility.
- Booking/reservation state.
- Impression limits.
- Campaign state.

---

## 11. Campaign management

Advertisers can create campaigns containing, as applicable:

- Campaign identity.
- Advertising content.
- Image or video.
- Target geography.
- Target Space characteristics.
- Audience/interest conditions.
- Budget.
- Purchase model.
- Start/end state.
- Priority.
- Frequency/impression conditions.

One advertising concept can have different presentation versions for different Space IDs. This applies to both image and video content.

---

## 12. Ad decision engine

The ad engine receives a Space ID and eligible campaigns and deterministically selects the advertisement to display.

Decision inputs include:

- Space-owner rules.
- Campaign rules.
- Purchase type.
- Reservation state.
- Impression count.
- Geography.
- Interests.
- Budget.
- Campaign status.
- Campaign priority.

Core commercial rules must be deterministic. AI may assist with content understanding, prediction, adaptation and analysis, but must not override core business rules.

---

## 13. Advertising content intelligence

For uploaded image/video content, Space ID may analyze:

- People.
- Text.
- Logos.
- Products.
- Important visual elements.
- Aspect ratio.
- Scenes that should not be cropped.

This supports content validation, adaptation and presentation across different Spaces.

---

## 14. Event system

Every meaningful Space ID operation must generate an event so that the operation can be measured later.

Core events include:

- SPACE_CREATED
- SPACE_APPROVED
- SPACE_DISCOVERED
- SPACE_READ
- SPACE_CONTENT_OPENED
- CAMPAIGN_CREATED
- CAMPAIGN_APPROVED
- AD_RENDERED
- AD_VIEWED
- AD_INTERACTED
- CAMPAIGN_PAUSED
- CAMPAIGN_COMPLETED
- SPACE_RENEWED
- SPACE_EXPIRED

Relevant event context includes, where necessary and lawful:

- Where.
- When.
- Space.
- Campaign.
- City.
- Category.
- Device.
- Content version.
- Audience segment.

Every event must have an operational or commercial reason for being collected.

---

## 15. Data and analytics

Space ID must preserve data in a form that supports future analysis.

### Space intelligence

Track, as applicable:

- Space locations.
- Types.
- Sizes.
- Shapes.
- Orientations.
- Buildings.
- Allowed sectors.
- Demand.
- Utilization.
- Revenue.
- Time without advertising.

### Advertiser intelligence

Track, as applicable:

- Advertising sectors.
- Requested locations.
- Requested Space types.
- Campaign types.
- Budgets.
- Content types.
- Unserved demand.

### Market intelligence

The system should eventually identify:

- Areas with high advertising demand and low Space inventory.
- Space types with high demand and insufficient supply.
- Emerging sectors in a city.
- Underperforming Space categories.
- New cities/areas/sectors worth entering.

The purpose is not to collect data indiscriminately. Each collected data point must support an operational, commercial, analytical, security, or product decision.

---

## 16. Privacy

Space ID follows Privacy by Design.

Operational data and personal data must be separated conceptually and technically where appropriate.

Operational examples:

- Space ID.
- Campaign.
- Ad event time.
- Space location.

Personal or identifiable data must be minimized, access-controlled and retained only when there is a clear legitimate need.

---

## 17. Technical architecture direction

### Mobile

- Flutter + Dart as the shared Android/iOS application layer.
- Native device capabilities are consumed rather than recreated.
- iOS: native AR/location/camera capabilities such as ARKit where required.
- Android: native AR/location/camera capabilities such as ARCore where required.

### Operational backend

- API/Gateway.
- Space Engine.
- Advertising Engine.
- Identity Engine.
- Event/Data Layer.
- PostgreSQL + PostGIS for the spatial operational foundation.

### Search

A dedicated geographic/search layer can be introduced where needed for spatial, semantic, vector and multimodal search. OpenSearch is the architectural candidate identified in the source design.

### Analytics

A separate analytical warehouse/lakehouse is required for long-term analysis. BigQuery is the candidate identified in the source design.

### AI interfaces

AI capabilities are separated by purpose:

- Vision understanding.
- Space recognition/matching.
- Advertising-content understanding.
- Content adaptation.
- Demand intelligence.
- Forecasting.

AI does not replace deterministic business rules.

---

## 18. Core application experiences

The Space ID application should expose these primary experiences:

1. **Scan / Read Space** — point the camera at a physical Space and retrieve what is inside it.
2. **Create Space** — register a new physical Space.
3. **Explore** — discover Spaces geographically.
4. **Space Details** — inspect the digital identity and contents of a Space.
5. **Manage Space** — owner controls, status, content and commercial information.
6. **Advertising** — discover inventory and manage campaigns.
7. **Content** — view image/video/interactive content associated with a Space.
8. **AR Experience** — present Space content spatially when AR is appropriate.
9. **Events & Performance** — record and expose relevant activity and performance.

---

## 19. Product principle

Space ID is not a camera application, AR application, map application, or advertising application in isolation.

It is a system that gives a physical place a persistent digital identity and allows that identity to be discovered through the physical world, opened through the application, populated with content, and used as a measurable commercial space.

The phone supplies the device capabilities. Space ID supplies the identity, spatial model, content, business rules, events, commercial logic and intelligence around the physical Space.
