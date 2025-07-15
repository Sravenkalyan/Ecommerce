// Simple test to verify Docker environment
console.log('Testing Docker environment...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test database connection
import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

try {
  const client = await pool.connect();
  console.log('✅ Database connection successful');
  client.release();
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
} finally {
  await pool.end();
}