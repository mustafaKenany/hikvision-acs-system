/**
 * Check work_schedules table structure
 */
import { sequelize } from './src/models/index.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Checking work_schedules table structure...\n');
    
    const [results] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'work_schedules' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Columns in work_schedules table:');
    console.log('=====================================');
    results.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
