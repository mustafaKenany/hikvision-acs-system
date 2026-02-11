/**
 * Create Super Admin User
 * سكربت لإنشاء مستخدم super admin
 */

import bcrypt from 'bcryptjs';
import { sequelize } from './src/models/index.js';

async function createSuperAdmin() {
  try {
    console.log('🔄 Creating super admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insert super admin user
    const [results] = await sequelize.query(`
      INSERT INTO users (
        name, 
        email, 
        password, 
        role, 
        is_active, 
        organization_id,
        permissions,
        created_at, 
        updated_at
      ) VALUES (
        'superadmin',
        'admin@system.com',
        '${hashedPassword}',
        'super_admin',
        true,
        1,
        '[]'::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE 
      SET password = EXCLUDED.password,
          role = EXCLUDED.role
      RETURNING id, name, email, role;
    `);

    console.log('✅ Super Admin created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Email: admin@system.com');
    console.log('   Password: admin123');
    console.log('   Name: superadmin');
    console.log('   Role: super_admin');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
