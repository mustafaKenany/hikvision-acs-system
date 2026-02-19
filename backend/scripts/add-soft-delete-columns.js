/**
 * Migrate: Add soft delete columns to devices table
 */

import { sequelize } from '../src/models/index.js';

async function migrate() {
  try {
    console.log('🔄 Adding soft delete columns to devices table...');

    await sequelize.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
    `);
    console.log('✅ Added deleted_at column');

    await sequelize.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);
    `);
    console.log('✅ Added deleted_by column');

    await sequelize.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
    `);
    console.log('✅ Added created_by column');

    await sequelize.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
    `);
    console.log('✅ Added updated_by column');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS devices_deleted_at_idx ON devices(deleted_at);
    `);
    console.log('✅ Created index on deleted_at');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
