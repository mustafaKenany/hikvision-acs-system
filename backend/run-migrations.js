/**
 * Run Database Migrations
 * Execute this file to add performance indexes to the database
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hikvision_acs_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function runMigrations() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Create migrations table if not exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sequelize_meta (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get all migration files
    const migrationsDir = join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.js'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration file(s)\n`);

    // Get already run migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT name FROM sequelize_meta ORDER BY name'
    );
    const executedNames = executedMigrations.map(m => m.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping: ${file} (already executed)`);
        continue;
      }

      console.log(`🔧 Running migration: ${file}`);
      
      try {
        const migrationPath = join(migrationsDir, file);
        const migrationURL = pathToFileURL(migrationPath).href;
        const migration = await import(migrationURL);
        
        // Execute UP migration
        await migration.default.up(sequelize.getQueryInterface(), Sequelize);
        
        // Record migration as executed
        await sequelize.query(
          'INSERT INTO sequelize_meta (name) VALUES (?)',
          {
            replacements: [file]
          }
        );
        
        console.log(`✅ Completed: ${file}\n`);
        
      } catch (error) {
        console.error(`❌ Failed to run migration ${file}:`, error.message);
        throw error;
      }
    }

    console.log('\n✅ All migrations completed successfully!');
    console.log('🚀 Database is now optimized for high performance\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
runMigrations();
