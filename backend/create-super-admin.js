/**
 * Create Super Admin User
 * Script to create initial super_admin for testing Organizations API
 */

import { sequelize, Organization, User } from './src/models/index.js';
async function createSuperAdmin() {
  try {
    console.log('📝 Creating test organization and super_admin user...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Create test organization
    const [organization, created] = await Organization.findOrCreate({
      where: { email: 'org@test.com' },
      defaults: {
        name: 'Test Organization',
        email: 'org@test.com',
        phone: '+964 770 123 4567',
        address: 'Baghdad, Iraq',
        subscription_plan: 'enterprise',
        subscription_start: new Date(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        max_employees: 1000,
        max_devices: 50,
        storage_limit_mb: 10000,
        is_active: true
      }
    });

    if (created) {
      console.log('✅ Organization created:', organization.name);
    } else {
      console.log('ℹ️  Organization already exists:', organization.name);
    }

    // Create super_admin user (password will be hashed by beforeCreate hook)
    const password = 'Super@123456';
    
    const [user, userCreated] = await User.findOrCreate({
      where: { email: 'super@admin.com' },
      defaults: {
        organization_id: organization.id,
        name: 'Super Administrator',
        email: 'super@admin.com',
        password: password, // Plain password - will be hashed automatically
        role: 'super_admin',
        phone: '+964 770 999 8888',
        is_active: true,
        permissions: ['all']
      }
    });

    if (userCreated) {
      console.log('✅ Super Admin user created:', user.email);
    } else {
      console.log('ℹ️  Super Admin already exists:', user.email);
    }

    console.log('\n✅ Setup complete!\n');
    console.log('📌 Login credentials:');
    console.log('   Email: super@admin.com');
    console.log('   Password: Super@123456\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createSuperAdmin();
