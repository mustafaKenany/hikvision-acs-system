'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('work_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      work_days: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
        allowNull: false
      },
      late_grace_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      early_leave_grace_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      break_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        allowNull: false
      },
      expected_hours: {
        type: Sequelize.DECIMAL(4, 2),
        defaultValue: 8.0,
        allowNull: false
      },
      is_flexible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
    await queryInterface.addIndex('work_schedules', ['organization_id']);
    await queryInterface.addIndex('work_schedules', ['name']);
    await queryInterface.addIndex('work_schedules', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('work_schedules');
  }
};
