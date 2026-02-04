'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_permissions', {
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
      door_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'doors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      timezone_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'access_timezones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      valid_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
      },
      valid_until: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      access_level: {
        type: Sequelize.ENUM('normal', 'vip', 'emergency', 'temporary', 'contractor'),
        defaultValue: 'normal',
        allowNull: false
      },
      require_pin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      pin_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      allow_entry: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      allow_exit: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      max_accesses_per_day: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      granted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      granted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      sync_status: {
        type: Sequelize.ENUM('pending', 'synced', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      },
      sync_error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      last_synced_at: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('access_permissions', ['organization_id']);
    await queryInterface.addIndex('access_permissions', ['employee_id']);
    await queryInterface.addIndex('access_permissions', ['door_id']);
    await queryInterface.addIndex('access_permissions', ['device_id']);
    await queryInterface.addIndex('access_permissions', ['timezone_id']);
    await queryInterface.addIndex('access_permissions', ['is_active']);
    await queryInterface.addIndex('access_permissions', ['sync_status']);
    await queryInterface.addIndex('access_permissions', ['valid_from']);
    await queryInterface.addIndex('access_permissions', ['valid_until']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('access_permissions');
  }
};
