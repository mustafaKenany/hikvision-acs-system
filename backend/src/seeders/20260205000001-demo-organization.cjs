'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash password for admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create default organization
    await queryInterface.bulkInsert('organizations', [
      {
        name: 'شركة النظام التجريبية',
        email: 'info@demo-company.test',
        phone: '07901234567',
        address: 'بغداد، العراق',
        subscription_plan: 'pro',
        subscription_start: new Date(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        max_employees: 500,
        max_devices: 20,
        storage_limit_mb: 10240, // 10GB
        is_active: true,
        settings: JSON.stringify({
          timezone: 'Asia/Baghdad',
          language: 'ar',
          date_format: 'DD/MM/YYYY',
          time_format: '24h',
          currency: 'IQD',
          features: {
            face_recognition: true,
            fingerprint: true,
            card_reader: true,
            temperature_check: true,
            mobile_app: true
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Created default organization');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizations', {
      email: 'info@demo-company.test'
    });
  }
};
