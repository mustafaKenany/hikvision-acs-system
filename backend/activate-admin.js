// Activate super_admin account
import pg from 'pg';

const client = new pg.Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'hikvision_acs_dev'
});

async function activateAdmin() {
  try {
    await client.connect();
    console.log('🔗 متصل بقاعدة البيانات...');
    
    const result = await client.query(`
      UPDATE users 
      SET is_active = true 
      WHERE role = 'super_admin'
      RETURNING id, name, email, is_active
    `);
    
    console.log('✅ تم تفعيل حسابات super_admin بنجاح:');
    console.log(result.rows);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await client.end();
    console.log('🔌 تم قطع الاتصال');
  }
}

activateAdmin();
