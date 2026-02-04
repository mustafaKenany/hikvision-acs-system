import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'hikvision_acs_dev',
  'postgres',
  '123',
  {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function testConnection() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
    
    const result = await sequelize.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result[0][0].version);
    
    // Check if database exists
    const [databases] = await sequelize.query(
      "SELECT datname FROM pg_database WHERE datname = 'hikvision_acs_dev'"
    );
    
    if (databases.length > 0) {
      console.log('✅ قاعدة البيانات hikvision_acs_dev موجودة!');
    } else {
      console.log('⚠️ قاعدة البيانات hikvision_acs_dev غير موجودة!');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:');
    console.error('السبب:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 تأكد من الباسورد في ملف .env');
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 نحتاج إنشاء قاعدة البيانات');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 تأكد أن PostgreSQL شغال');
    }
    
    process.exit(1);
  }
}

testConnection();
