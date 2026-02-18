/**
 * Database Seeder Runner
 * تشغيل ملفات البيانات الأولية (Seeders)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';
import { createRequire } from 'module';
import dotenv from 'dotenv';

// Create require for CommonJS modules
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEEDERS_DIR = path.join(__dirname, '..', 'seeders');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'hikvision_acs_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

/**
 * Run a single seeder
 */
async function runSeeder(filename) {
  const seederPath = path.join(SEEDERS_DIR, filename);
  
  console.log(`🌱 Running seeder: ${filename}`);
  
  try {
    // Load seeder (CommonJS format)
    const seeder = require(seederPath);
    
    // Execute seeder
    await seeder.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log(`✅ Seeder completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Seeder failed: ${filename}`, error.message);
    throw error;
  }
}

/**
 * Run all seeders
 */
async function runAllSeeders() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get all seeder files (sorted by name)
    const files = fs.readdirSync(SEEDERS_DIR)
      .filter(file => file.endsWith('.cjs') || file.endsWith('.js'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️ No seeders found');
      return;
    }

    console.log(`📋 Found ${files.length} seeders`);

    // Run each seeder sequentially
    for (const file of files) {
      await runSeeder(file);
    }

    console.log('');
    console.log('🎉 All seeders completed successfully!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeders
runAllSeeders();
