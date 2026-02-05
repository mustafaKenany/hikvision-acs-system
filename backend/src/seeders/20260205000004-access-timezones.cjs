'use strict';

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

    // Create access time zones
    await queryInterface.bulkInsert('access_timezones', [
      {
        organization_id: organizationId,
        name: 'دوام كامل 24/7',
        description: 'وصول على مدار الساعة طوال أيام الأسبوع',
        time_segments: JSON.stringify([
          {
            day: 0, // Sunday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 1, // Monday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 2, // Tuesday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 3, // Wednesday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 4, // Thursday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 5, // Friday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 6, // Saturday
            start: '00:00',
            end: '23:59'
          }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'ساعات العمل الرسمية',
        description: 'من الأحد إلى الخميس (8:00 - 16:00)',
        time_segments: JSON.stringify([
          {
            day: 0, // Sunday
            start: '08:00',
            end: '16:00'
          },
          {
            day: 1, // Monday
            start: '08:00',
            end: '16:00'
          },
          {
            day: 2, // Tuesday
            start: '08:00',
            end: '16:00'
          },
          {
            day: 3, // Wednesday
            start: '08:00',
            end: '16:00'
          },
          {
            day: 4, // Thursday
            start: '08:00',
            end: '16:00'
          }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'ساعات العمل الممتدة',
        description: 'من الأحد إلى الخميس (7:00 - 19:00)',
        time_segments: JSON.stringify([
          {
            day: 0,
            start: '07:00',
            end: '19:00'
          },
          {
            day: 1,
            start: '07:00',
            end: '19:00'
          },
          {
            day: 2,
            start: '07:00',
            end: '19:00'
          },
          {
            day: 3,
            start: '07:00',
            end: '19:00'
          },
          {
            day: 4,
            start: '07:00',
            end: '19:00'
          }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'عطلة نهاية الأسبوع',
        description: 'الجمعة والسبت فقط',
        time_segments: JSON.stringify([
          {
            day: 5, // Friday
            start: '00:00',
            end: '23:59'
          },
          {
            day: 6, // Saturday
            start: '00:00',
            end: '23:59'
          }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Created access time zones:');
    console.log('   - دوام كامل 24/7');
    console.log('   - ساعات العمل الرسمية (8:00 - 16:00)');
    console.log('   - ساعات العمل الممتدة (7:00 - 19:00)');
    console.log('   - عطلة نهاية الأسبوع');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('access_timezones', {
      name: {
        [Sequelize.Op.in]: [
          'دوام كامل 24/7',
          'ساعات العمل الرسمية',
          'ساعات العمل الممتدة',
          'عطلة نهاية الأسبوع'
        ]
      }
    });
  }
};
