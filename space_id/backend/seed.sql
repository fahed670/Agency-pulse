INSERT INTO spaces (id, status, latitude, longitude, accuracy_meters, image_reference)
VALUES
  ('SP-DEMO-001', 'ACTIVE', 24.2075, 55.7447, 8.0, 'demo://space/SP-DEMO-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO space_contents (space_id, content_type, title, body, status, sort_order)
VALUES
  ('SP-DEMO-001', 'INFO', 'Welcome to Space ID', 'This is a demonstration Space. Its content is attached to the physical Space record.', 'PUBLISHED', 0),
  ('SP-DEMO-001', 'ACTION', 'Open Space experience', 'The Space can expose actions, links, offers or media without changing its physical identity.', 'PUBLISHED', 1)
ON CONFLICT DO NOTHING;
