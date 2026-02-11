/**
 * Migration: Create access_logs table
 * سجلات الدخول والخروج من الأجهزة
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Device that logged the access event'
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Employee associated with the access (null if not found)'
      },
      employee_no: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Employee number from device'
      },
      employee_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Employee name (from Employee record or device)'
      },
      log_type: {
        type: Sequelize.ENUM('check_in', 'check_out', 'unknown'),
        defaultValue: 'unknown',
        allowNull: false,
        comment: 'Type of access event'
      },
      verification_method: {
        type: Sequelize.ENUM('face', 'fingerprint', 'card', 'password', 'unknown'),
        defaultValue: 'unknown',
        allowNull: false,
        comment: 'Method used for verification'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Time of access event'
      },
      temperature: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
        comment: 'Body temperature if device supports it (Celsius)'
      },
      mask_detection: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        comment: 'Whether mask was detected (if supported)'
      },
      photo_url: {
        type: Sequelize.STRING(512),
        allowNull: true,
        comment: 'URL/path to captured photo during access'
      },
      door_number: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Door/reader number on device'
      },
      event_type: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Device event type code'
      },
      raw_data: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Raw JSON data from device'
      },
      sync_status: {
        type: Sequelize.ENUM('synced', 'pending', 'failed'),
        defaultValue: 'synced',
        allowNull: false,
        comment: 'Sync status from device'
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Create indexes
    await queryInterface.addIndex('access_logs', ['device_id'], {
      name: 'idx_access_logs_device_id'
    });

    await queryInterface.addIndex('access_logs', ['employee_id'], {
      name: 'idx_access_logs_employee_id'
    });

    await queryInterface.addIndex('access_logs', ['employee_no'], {
      name: 'idx_access_logs_employee_no'
    });

    await queryInterface.addIndex('access_logs', ['timestamp'], {
      name: 'idx_access_logs_timestamp'
    });

    await queryInterface.addIndex('access_logs', ['log_type'], {
      name: 'idx_access_logs_log_type'
    });

    await queryInterface.addIndex('access_logs', ['verification_method'], {
      name: 'idx_access_logs_verification_method'
    });

    await queryInterface.addIndex('access_logs', ['sync_status'], {
      name: 'idx_access_logs_sync_status'
    });

    await queryInterface.addIndex('access_logs', ['is_deleted'], {
      name: 'idx_access_logs_is_deleted'
    });

    // Composite index for common queries
    await queryInterface.addIndex('access_logs', ['device_id', 'timestamp'], {
      name: 'idx_access_logs_device_timestamp'
    });

    await queryInterface.addIndex('access_logs', ['employee_id', 'timestamp'], {
      name: 'idx_access_logs_employee_timestamp'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('access_logs');
  }
};
