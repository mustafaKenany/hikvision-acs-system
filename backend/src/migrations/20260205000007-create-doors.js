'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doors', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      door_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      door_type: {
        type: Sequelize.ENUM('automatic', 'manual', 'turnstile', 'gate', 'barrier'),
        defaultValue: 'automatic',
        allowNull: false
      },
      unlock_mode: {
        type: Sequelize.ENUM('normal', 'always_open', 'always_closed'),
        defaultValue: 'normal',
        allowNull: false
      },
      unlock_duration: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      door_held_alarm_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: false
      },
      door_open_timeout: {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        allowNull: false
      },
      magnetic_lock: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      door_sensor: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      exit_button: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      two_person_rule: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      anti_passback: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      is_emergency_door: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      door_status: {
        type: Sequelize.ENUM('closed', 'open', 'locked', 'unlocked', 'alarm', 'unknown'),
        defaultValue: 'unknown',
        allowNull: false
      },
      last_status_update: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      settings: {
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
    await queryInterface.addIndex('doors', ['organization_id']);
    await queryInterface.addIndex('doors', ['device_id']);
    await queryInterface.addIndex('doors', ['name']);
    await queryInterface.addIndex('doors', ['is_active']);
    await queryInterface.addIndex('doors', ['door_status']);
    await queryInterface.addIndex('doors', ['device_id', 'door_number'], { 
      unique: true, 
      name: 'unique_device_door_number' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('doors');
  }
};
