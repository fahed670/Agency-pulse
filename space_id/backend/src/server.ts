import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const spaces = new Map<string, Record<string, unknown>>();
const events: Record<string, unknown>[] = [];

function seedDemoSpace() {
  if (spaces.has('SP-DEMO-001')) return;

  spaces.set('SP-DEMO-001', {
    spaceId: 'SP-DEMO-001',
    status: 'ACTIVE',
    createdAt: '2026-08-13T00:00:00.000Z',
    latitude: 24.2075,
    longitude: 55.7447,
    accuracyMeters: 8,
    imageReference: 'demo://space/SP-DEMO-001',
    content: [
      {
        type: 'INFO',
        title: 'Welcome to Space ID',
        body: 'This is a shared demonstration Space.',
        value: 'This is a shared demonstration Space.',
        status: 'PUBLISHED',
        sortOrder: 0,
      },
      {
        type: 'ACTION',
        title: 'Open Space experience',
        body: 'A Space can expose actions, links, offers or media.',
        value: 'A Space can expose actions, links, offers or media.',
        status: 'PUBLISHED',
        sortOrder: 1,
      },
    ],
  });
}

seedDemoSpace();

app.get('/health', (_req, res) => {
  res.json({
    service: 'space-id',
    status: 'ok',
    storage: 'in-memory-development-store',
    spatialDatabase: 'not-connected',
  });
});

app.get('/spaces/:spaceId', (req, res) => {
  const space = spaces.get(req.params.spaceId);
  if (!space) {
    return res.status(404).json({ error: 'SPACE_NOT_FOUND' });
  }
  return res.json(space);
});

app.get('/spaces/nearby', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusMeters = Number(req.query.radiusMeters);

  if (![lat, lng, radiusMeters].every(Number.isFinite) || radiusMeters < 0) {
    return res.status(400).json({ error: 'INVALID_LOCATION_QUERY' });
  }

  // Development fallback. Production will replace this calculation with PostGIS ST_DWithin.
  const candidates = [...spaces.values()].filter((space) => {
    const spaceLat = Number(space.latitude);
    const spaceLng = Number(space.longitude);
    if (!Number.isFinite(spaceLat) || !Number.isFinite(spaceLng)) return false;
    const dLat = (spaceLat - lat) * 111_320;
    const dLng = (spaceLng - lng) * 111_320 * Math.cos((lat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng) <= radiusMeters;
  });

  return res.json({ spaces: candidates });
});

app.post('/spaces', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const spaceId = typeof body.spaceId === 'string' ? body.spaceId.trim() : '';
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!spaceId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: 'INVALID_SPACE' });
  }

  const existing = spaces.get(spaceId);
  if (existing) {
    return res.status(200).json(existing);
  }

  const now = new Date().toISOString();
  const space = {
    ...body,
    spaceId,
    latitude,
    longitude,
    createdAt: body.createdAt ?? now,
    status: body.status ?? 'SUBMITTED',
    content: Array.isArray(body.content) ? body.content : [],
  };

  spaces.set(spaceId, space);
  return res.status(201).json(space);
});

app.post('/events', (req, res) => {
  const event = req.body as Record<string, unknown>;
  if (
    typeof event.eventType !== 'string' ||
    typeof event.spaceId !== 'string' ||
    typeof event.occurredAt !== 'string'
  ) {
    return res.status(400).json({ error: 'INVALID_EVENT' });
  }

  const record = {
    ...event,
    receivedAt: new Date().toISOString(),
  };
  events.push(record);
  return res.status(202).json({ accepted: true, event: record });
});

app.get('/events', (_req, res) => {
  return res.json({ events });
});

app.listen(port, () => {
  console.log(`Space ID backend listening on :${port}`);
});
