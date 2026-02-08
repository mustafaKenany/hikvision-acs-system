/**
 * Add sync tracking columns to employees table
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hikvision_acs_dev',
  user: 'postgres',
  password: '123'
});

async function addSyncColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Adding sync tracking columns to employees table...');
    
    await client.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS synced_to_device BOOLEAN DEFAULT FALSE;
    `);
    
    await client.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;
    `);
    
    await client.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS model VARCHAR(100);
    `);
    
    await client.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100);
    `);
    
    await client.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
    `);
    
    console.log('✅ Columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addSyncColumns();
