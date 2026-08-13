import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const spaces = new Map<string, Record<string, unknown>>();
const events: Record<string, unknown>[] = [];

app.get('/health', (_req, res) => {
  res.json({ service: 'space-id', status: 'ok' });
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

  // The production implementation will use PostGIS distance queries.
  // This endpoint establishes the stable application contract first.
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
  const spaceId = typeof body.spaceId === 'string' ? body.spaceId : '';
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!spaceId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: 'INVALID_SPACE' });
  }

  const space = {
    ...body,
    spaceId,
    latitude,
    longitude,
    status: body.status ?? 'SUBMITTED',
    content: body.content ?? [],
  };
  spaces.set(spaceId, space);
  return res.status(201).json(space);
});

app.post('/events', (req, res) => {
  const event = req.body as Record<string, unknown>;
  if (typeof event.eventType !== 'string' || typeof event.spaceId !== 'string') {
    return res.status(400).json({ error: 'INVALID_EVENT' });
  }
  events.push({ ...event, receivedAt: new Date().toISOString() });
  return res.status(202).json({ accepted: true });
});

app.listen(port, () => {
  console.log(`Space ID backend listening on :${port}`);
});
