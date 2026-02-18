/**
 * Migration: Add unique constraints to employees table
 * Date: 2026-02-14
 * 
 * Changes:
 * - Add unique constraint on name field
 * - Add unique constraint on phone field (where not null)
 * - Add unique constraint on email field (where not null)
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adding unique constraints to employees table...');

    try {
      // 1. Add unique constraint on name
      await queryInterface.addConstraint('employees', {
        fields: ['name'],
        type: 'unique',
        name: 'unique_employee_name'
      });
      console.log('✅ Added unique constraint on name');

      // 2. Add unique constraint on phone (partial - where phone is not null)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX unique_employee_phone 
        ON employees (phone) 
        WHERE phone IS NOT NULL AND phone != '';
      `);
      console.log('✅ Added unique constraint on phone (partial)');

      // 3. Add unique constraint on email (partial - where email is not null)
      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX unique_employee_email 
        ON employees (email) 
        WHERE email IS NOT NULL AND email != '';
      `);
      console.log('✅ Added unique constraint on email (partial)');

      console.log('🎉 All unique constraints added successfully!');
    } catch (error) {
      console.error('❌ Error adding constraints:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing unique constraints from employees table...');

    try {
      // Remove unique constraint on name
      await queryInterface.removeConstraint('employees', 'unique_employee_name');
      console.log('✅ Removed unique constraint on name');

      // Remove unique index on phone
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS unique_employee_phone;');
      console.log('✅ Removed unique constraint on phone');

      // Remove unique index on email
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS unique_employee_email;');
      console.log('✅ Removed unique constraint on email');

      console.log('🎉 All unique constraints removed successfully!');
    } catch (error) {
      console.error('❌ Error removing constraints:', error.message);
      throw error;
    }
  }
};
