/**
 * تشغيل Migration تلقائياً من Node.js
 */

import pg from 'pg';
const { Client } = pg;

// معلومات الاتصال بقاعدة البيانات
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'hikvision_acs_dev'
});

async function runMigration() {
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...\n');
    await client.connect();
    console.log('✅ تم الاتصال!\n');

    // 1. إضافة حقل sdk_port
    console.log('📝 إضافة حقل sdk_port...');
    await client.query(`
      ALTER TABLE devices 
      ADD COLUMN IF NOT EXISTS sdk_port INTEGER DEFAULT 8000;
    `);
    console.log('✅ تم إضافة حقل sdk_port\n');

    // 2. تحديث بورت الجهاز 192.168.1.84 ليستخدم البورت 80
    console.log('🔄 تحديث بورت الجهاز 192.168.1.84...');
    const updateResult = await client.query(`
      UPDATE devices 
      SET sdk_port = 80 
      WHERE ip_address = '192.168.1.84';
    `);
    console.log(`✅ تم تحديث ${updateResult.rowCount} جهاز\n`);

    // 3. عرض جميع الأجهزة
    console.log('📊 قائمة الأجهزة الحالية:\n');
    const result = await client.query(`
      SELECT id, name, ip_address, port as http_port, sdk_port 
      FROM devices 
      ORDER BY id;
    `);

    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('ID | Name              | IP Address      | HTTP Port | SDK Port');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    
    result.rows.forEach(row => {
      console.log(
        `${row.id.toString().padEnd(3)}| ` +
        `${(row.name || '').padEnd(18)}| ` +
        `${(row.ip_address || '').padEnd(16)}| ` +
        `${(row.http_port || '').toString().padEnd(10)}| ` +
        `${row.sdk_port || ''}`
      );
    });
    
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // 4. عرض الجهاز المحدّث
    const updated = result.rows.find(r => r.ip_address === '192.168.1.84');
    if (updated) {
      console.log('✨ الجهاز المحدّث:');
      console.log(`   الاسم: ${updated.name}`);
      console.log(`   IP: ${updated.ip_address}`);
      console.log(`   HTTP Port: ${updated.http_port}`);
      console.log(`   SDK Port: ${updated.sdk_port} ⭐\n`);
    }

    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    console.log('✅ تم تطبيق جميع التغييرات بنجاح!\n');
    console.log('🔄 الخطوة التالية:');
    console.log('   1. أعد تشغيل Backend (Ctrl+C ثم npm start)');
    console.log('   2. جرب رفع صورة موظف\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    console.error('\nالتفاصيل:', error);
  } finally {
    await client.end();
    console.log('🔌 تم قطع الاتصال\n');
  }
}

runMigration();
