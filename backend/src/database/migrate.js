/**
 * Database Migration Runner
 * تشغيل ملفات الهجرة (Migrations)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = 'migrations';

/**
 * Create migrations tracking table
 */
async function createMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get executed migrations
 */
async function getExecutedMigrations() {
  const [results] = await sequelize.query(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name`
  );
  return results.map(row => row.name);
}

/**
 * Mark migration as executed
 */
async function markMigrationAsExecuted(name) {
  await sequelize.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (:name)`,
    { replacements: { name } }
  );
}

/**
 * Get pending migrations
 */
async function getPendingMigrations() {
  // Get all migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .sort();

  // Get executed migrations
  const executed = await getExecutedMigrations();

  // Return pending migrations
  return files.filter(file => !executed.includes(file));
}

/**
 * Run a single migration
 */
async function runMigration(filename) {
  const migrationPath = path.join(MIGRATIONS_DIR, filename);
  
  logger.info(`Running migration: ${filename}`);
  
  try {
    const migration = await import(`file://${migrationPath}`);
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Execute migration
      await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
      
      // Mark as executed
      await markMigrationAsExecuted(filename);
      
      // Commit transaction
      await transaction.commit();
      
      logger.info(`✅ Migration completed: ${filename}`);
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
}

/**
 * Run all pending migrations
 */
async function migrate() {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('✅ Database connected');

    // Create migrations table
    await createMigrationsTable();
    logger.info('✅ Migrations table ready');

    // Get pending migrations
    const pending = await getPendingMigrations();

    if (pending.length === 0) {
      logger.info('✨ No pending migrations');
      return;
    }

    logger.info(`📋 Found ${pending.length} pending migration(s)`);

    // Run each migration
    for (const migration of pending) {
      await runMigration(migration);
    }

    logger.info('✨ All migrations completed successfully');
  } catch (error) {
    logger.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

/**
 * Rollback last migration
 */
async function rollback() {
  try {
    await sequelize.authenticate();
    
    // Get last executed migration
    const [results] = await sequelize.query(
      `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id DESC LIMIT 1`
    );

    if (results.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const { name: filename } = results[0];
    const migrationPath = path.join(MIGRATIONS_DIR, filename);
    
    logger.info(`Rolling back: ${filename}`);
    
    const migration = await import(`file://${migrationPath}`);
    
    // Execute rollback
    await migration.down(sequelize.getQueryInterface(), sequelize.constructor);
    
    // Remove from tracking table
    await sequelize.query(
      `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = :name`,
      { replacements: { name: filename } }
    );
    
    logger.info(`✅ Rollback completed: ${filename}`);
  } catch (error) {
    logger.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
const command = process.argv[2];

if (command === 'rollback') {
  rollback();
} else {
  migrate();
}
