import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard PostgreSQL connection for Docker/local development
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false // Disable SSL for local Docker PostgreSQL
});

export { pool };
export const db = drizzle(pool, { schema });