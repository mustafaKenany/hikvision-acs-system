'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance_summaries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'holiday', 'leave'),
        defaultValue: 'present',
        allowNull: false
      },
      working_hours: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: 0,
        allowNull: false
      },
      overtime_hours: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: 0,
        allowNull: false
      },
      late_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      early_leave_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('attendance_summaries', ['employee_id']);
    await queryInterface.addIndex('attendance_summaries', ['date']);
    await queryInterface.addIndex('attendance_summaries', ['status']);
    await queryInterface.addIndex('attendance_summaries', ['employee_id', 'date'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendance_summaries');
  }
};
