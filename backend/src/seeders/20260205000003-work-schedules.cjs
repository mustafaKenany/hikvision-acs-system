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

    // Create work schedules
    await queryInterface.bulkInsert('work_schedules', [
      {
        organization_id: organizationId,
        name: 'دوام رسمي',
        description: 'الدوام الرسمي من الأحد إلى الخميس (8:00 - 16:00)',
        start_time: '08:00:00',
        end_time: '16:00:00',
        work_days: '{0,1,2,3,4}', // Sunday to Thursday (0=Sunday, 6=Saturday)
        late_grace_minutes: 15,
        early_leave_grace_minutes: 10,
        break_duration: 60, // 1 hour lunch break
        expected_hours: 8.00,
        is_flexible: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'دوام مرن',
        description: 'دوام مرن للموظفين الإداريين',
        start_time: '07:00:00',
        end_time: '15:00:00',
        work_days: '{0,1,2,3,4}',
        late_grace_minutes: 30,
        early_leave_grace_minutes: 30,
        break_duration: 60,
        expected_hours: 8.00,
        is_flexible: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'دوام نصفي صباحي',
        description: 'الدوام النصفي الصباحي (8:00 - 12:00)',
        start_time: '08:00:00',
        end_time: '12:00:00',
        work_days: '{0,1,2,3,4,5,6}', // All days
        late_grace_minutes: 10,
        early_leave_grace_minutes: 5,
        break_duration: 0,
        expected_hours: 4.00,
        is_flexible: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        organization_id: organizationId,
        name: 'دوام على مدار الساعة',
        description: 'دوام 24 ساعة للحراس وعمال النظافة',
        start_time: '00:00:00',
        end_time: '23:59:59',
        work_days: '{0,1,2,3,4,5,6}',
        late_grace_minutes: 0,
        early_leave_grace_minutes: 0,
        break_duration: 120,
        expected_hours: 24.00,
        is_flexible: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Created work schedules:');
    console.log('   - دوام رسمي (8:00 - 16:00)');
    console.log('   - دوام مرن');
    console.log('   - دوام نصفي صباحي');
    console.log('   - دوام على مدار الساعة');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('work_schedules', {
      name: {
        [Sequelize.Op.in]: [
          'دوام رسمي',
          'دوام مرن',
          'دوام نصفي صباحي',
          'دوام على مدار الساعة'
        ]
      }
    });
  }
};
