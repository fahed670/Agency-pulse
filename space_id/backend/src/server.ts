import express from 'express';
import cors from 'cors';
import { checkDatabase, pool } from './db.js';

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const memorySpaces = new Map<string, Record<string, unknown>>();
const memoryEvents: Record<string, unknown>[] = [];

function seedMemorySpace() {
  if (memorySpaces.has('SP-DEMO-001')) return;
  memorySpaces.set('SP-DEMO-001', {
    spaceId: 'SP-DEMO-001',
    status: 'ACTIVE',
    createdAt: '2026-08-13T00:00:00.000Z',
    latitude: 24.2075,
    longitude: 55.7447,
    accuracyMeters: 8,
    imageReference: 'demo://space/SP-DEMO-001',
    content: [
      { type: 'INFO', title: 'Welcome to Space ID', body: 'This is a shared demonstration Space.', value: 'This is a shared demonstration Space.', status: 'PUBLISHED', sortOrder: 0 },
      { type: 'ACTION', title: 'Open Space experience', body: 'A Space can expose actions, links, offers or media.', value: 'A Space can expose actions, links, offers or media.', status: 'PUBLISHED', sortOrder: 1 },
    ],
  });
}
seedMemorySpace();

function dbEnabled(): boolean {
  return pool !== null;
}

async function getSpaceFromDb(spaceId: string) {
  if (!pool) return null;
  const result = await pool.query(
    `SELECT s.id AS "spaceId", s.status, s.latitude, s.longitude,
            s.accuracy_meters AS "accuracyMeters", s.image_reference AS "imageReference",
            s.created_at AS "createdAt", s.updated_at AS "updatedAt",
            COALESCE((SELECT json_agg(json_build_object(
              'id', c.id, 'type', c.content_type, 'title', c.title, 'body', c.body,
              'mediaReference', c.media_reference, 'targetUrl', c.target_url,
              'status', c.status, 'sortOrder', c.sort_order, 'version', c.version
            ) ORDER BY c.sort_order, c.id) FROM space_contents c
            WHERE c.space_id = s.id AND c.status = 'PUBLISHED'), '[]'::json) AS content
     FROM spaces s WHERE s.id = $1`,
    [spaceId],
  );
  return result.rows[0] ?? null;
}

app.get('/health', async (_req, res) => {
  let database = false;
  try { database = await checkDatabase(); } catch { database = false; }
  res.json({
    service: 'space-id',
    status: 'ok',
    storage: database ? 'postgresql-postgis' : 'in-memory-development-store',
    spatialDatabase: database ? 'connected' : 'not-connected',
  });
});

app.get('/spaces/:spaceId', async (req, res) => {
  if (dbEnabled()) {
    try {
      const space = await getSpaceFromDb(req.params.spaceId);
      if (!space) return res.status(404).json({ error: 'SPACE_NOT_FOUND' });
      return res.json(space);
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'DATABASE_UNAVAILABLE' });
    }
  }

  const space = memorySpaces.get(req.params.spaceId);
  if (!space) return res.status(404).json({ error: 'SPACE_NOT_FOUND' });
  return res.json(space);
});

app.get('/spaces/nearby', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusMeters = Number(req.query.radiusMeters);
  if (![lat, lng, radiusMeters].every(Number.isFinite) || radiusMeters < 0) {
    return res.status(400).json({ error: 'INVALID_LOCATION_QUERY' });
  }

  if (dbEnabled()) {
    try {
      const result = await pool!.query(
        `SELECT id AS "spaceId", status, latitude, longitude,
                accuracy_meters AS "accuracyMeters", image_reference AS "imageReference",
                created_at AS "createdAt"
         FROM spaces
         WHERE status = 'ACTIVE'
           AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
         ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography)`,
        [lng, lat, radiusMeters],
      );
      return res.json({ spaces: result.rows });
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'DATABASE_UNAVAILABLE' });
    }
  }

  const candidates = [...memorySpaces.values()].filter((space) => {
    const spaceLat = Number(space.latitude);
    const spaceLng = Number(space.longitude);
    if (!Number.isFinite(spaceLat) || !Number.isFinite(spaceLng)) return false;
    const dLat = (spaceLat - lat) * 111_320;
    const dLng = (spaceLng - lng) * 111_320 * Math.cos((lat * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng) <= radiusMeters;
  });
  return res.json({ spaces: candidates });
});

app.post('/spaces', async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const spaceId = typeof body.spaceId === 'string' ? body.spaceId.trim() : '';
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const accuracyMeters = Number(body.accuracyMeters ?? 0);
  if (!spaceId || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return res.status(400).json({ error: 'INVALID_SPACE' });
  }

  if (dbEnabled()) {
    try {
      const result = await pool!.query(
        `INSERT INTO spaces (id, status, latitude, longitude, accuracy_meters, image_reference)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
         RETURNING id AS "spaceId", status, latitude, longitude,
                   accuracy_meters AS "accuracyMeters", image_reference AS "imageReference",
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [spaceId, typeof body.status === 'string' ? body.status : 'SUBMITTED', latitude, longitude,
          Number.isFinite(accuracyMeters) ? accuracyMeters : null,
          typeof body.imageReference === 'string' ? body.imageReference : null],
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'DATABASE_UNAVAILABLE' });
    }
  }

  const existing = memorySpaces.get(spaceId);
  if (existing) return res.status(200).json(existing);
  const now = new Date().toISOString();
  const space = { ...body, spaceId, latitude, longitude, createdAt: body.createdAt ?? now, status: body.status ?? 'SUBMITTED', content: Array.isArray(body.content) ? body.content : [] };
  memorySpaces.set(spaceId, space);
  return res.status(201).json(space);
});

app.post('/events', async (req, res) => {
  const event = req.body as Record<string, unknown>;
  if (typeof event.eventType !== 'string' || typeof event.spaceId !== 'string' || typeof event.occurredAt !== 'string') {
    return res.status(400).json({ error: 'INVALID_EVENT' });
  }

  if (dbEnabled()) {
    try {
      await pool!.query(
        `INSERT INTO space_events (event_type, space_id, occurred_at, session_id, device_id, content_version, campaign_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
        [event.eventType, event.spaceId, event.occurredAt,
          typeof event.sessionId === 'string' ? event.sessionId : null,
          typeof event.deviceId === 'string' ? event.deviceId : null,
          Number.isFinite(Number(event.contentVersion)) ? Number(event.contentVersion) : null,
          typeof event.campaignId === 'string' ? event.campaignId : null,
          JSON.stringify(event.metadata ?? {})],
      );
      return res.status(202).json({ accepted: true, storage: 'postgresql' });
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'DATABASE_UNAVAILABLE' });
    }
  }

  const record = { ...event, receivedAt: new Date().toISOString() };
  memoryEvents.push(record);
  return res.status(202).json({ accepted: true, storage: 'memory' });
});

app.get('/events', async (_req, res) => {
  if (dbEnabled()) {
    try {
      const result = await pool!.query(
        `SELECT id, event_type AS "eventType", space_id AS "spaceId", occurred_at AS "occurredAt",
                session_id AS "sessionId", device_id AS "deviceId", content_version AS "contentVersion",
                campaign_id AS "campaignId", metadata, received_at AS "receivedAt"
         FROM space_events ORDER BY occurred_at DESC LIMIT 500`,
      );
      return res.json({ events: result.rows, storage: 'postgresql' });
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: 'DATABASE_UNAVAILABLE' });
    }
  }
  return res.json({ events: memoryEvents, storage: 'memory' });
});

app.listen(port, () => console.log(`Space ID backend listening on :${port}`));
