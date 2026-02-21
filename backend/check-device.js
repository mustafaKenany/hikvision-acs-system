import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  database: 'hikvision_acs_dev',
  user: 'postgres',
  password: '123',
  port: 5432
});

async function checkDevice() {
  try {
    const result = await pool.query(
      'SELECT id, name, ip_address, port, sdk_port FROM devices WHERE ip_address = $1',
      ['192.168.1.84']
    );
    
    if (result.rows.length > 0) {
      console.log('\n✅ Device Found:');
      console.log('━'.repeat(50));
      console.log(`ID:         ${result.rows[0].id}`);
      console.log(`Name:       ${result.rows[0].name}`);
      console.log(`IP:         ${result.rows[0].ip_address}`);
      console.log(`HTTP Port:  ${result.rows[0].port}`);
      console.log(`SDK Port:   ${result.rows[0].sdk_port} ${result.rows[0].sdk_port === 80 ? '⭐ (Custom)' : '(Default)'}`);
      console.log('━'.repeat(50));
    } else {
      console.log('\n❌ Device not found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkDevice();
