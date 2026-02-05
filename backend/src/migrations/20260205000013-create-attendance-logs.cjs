'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance_logs', {
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
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      door_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'doors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      event_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      event_type: {
        type: Sequelize.ENUM('check_in', 'check_out', 'break_start', 'break_end'),
        allowNull: false
      },
      verification_method: {
        type: Sequelize.ENUM('face', 'card', 'fingerprint', 'qr_code', 'manual'),
        allowNull: false
      },
      is_successful: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      temperature: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM('device', 'manual', 'api'),
        defaultValue: 'device',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
    await queryInterface.addIndex('attendance_logs', ['employee_id']);
    await queryInterface.addIndex('attendance_logs', ['device_id']);
    await queryInterface.addIndex('attendance_logs', ['door_id']);
    await queryInterface.addIndex('attendance_logs', ['event_time']);
    await queryInterface.addIndex('attendance_logs', ['event_type']);
    await queryInterface.addIndex('attendance_logs', ['employee_id', 'event_time']);
    await queryInterface.addIndex('attendance_logs', ['is_successful']);
    await queryInterface.addIndex('attendance_logs', ['source']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attendance_logs');
  }
};
