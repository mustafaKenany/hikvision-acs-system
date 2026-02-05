'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the organization ID
    const [organizations] = await queryInterface.sequelize.query(
      `SELECT id FROM organizations WHERE email = 'info@demo-company.test' LIMIT 1`
    );

    if (organizations.length === 0) {
      throw new Error('Organization not found. Please run organization seeder first.');
    }

    const organizationId = organizations[0].id;

    // Hash passwords
    const superAdminPassword = await bcrypt.hash('Admin@123', 10);
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const viewerPassword = await bcrypt.hash('Viewer@123', 10);

    // Create users
    await queryInterface.bulkInsert('users', [
      {
        organization_id: organizationId,
        name: 'مدير النظام',
        email: 'admin@demo.test',
        password: superAdminPassword,
        role: 'super_admin',
        permissions: JSON.stringify([]),
        phone: '07901234567',
        is_active: true,
        last_login: null,
        reset_password_token: null,
        reset_password_expires: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'مدير الموارد البشرية',
        email: 'manager@demo.test',
        password: managerPassword,
        role: 'manager',
        permissions: JSON.stringify([]),
        phone: '07901234568',
        is_active: true,
        last_login: null,
        reset_password_token: null,
        reset_password_expires: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'مراقب النظام',
        email: 'viewer@demo.test',
        password: viewerPassword,
        role: 'viewer',
        permissions: JSON.stringify([]),
        phone: '07901234569',
        is_active: true,
        last_login: null,
        reset_password_token: null,
        reset_password_expires: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Created demo users:');
    console.log('   - Super Admin: admin@demo.test / Admin@123');
    console.log('   - Manager: manager@demo.test / Manager@123');
    console.log('   - Viewer: viewer@demo.test / Viewer@123');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@demo.test', 'manager@demo.test', 'viewer@demo.test']
      }
    });
  }
};
