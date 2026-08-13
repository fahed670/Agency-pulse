import pg from 'pg';

const { Pool } = pg;

export const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    })
  : null;

export async function checkDatabase(): Promise<boolean> {
  if (!pool) return false;
  const result = await pool.query('SELECT 1 AS ok');
  return result.rows[0]?.ok === 1;
}

export async function closeDatabase(): Promise<void> {
  if (pool) await pool.end();
}
