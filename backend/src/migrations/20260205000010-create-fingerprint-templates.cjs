'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fingerprint_templates', {
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
      finger_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      template_data: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      quality_score: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.addIndex('fingerprint_templates', ['employee_id']);
    await queryInterface.addIndex('fingerprint_templates', ['device_id']);
    await queryInterface.addIndex('fingerprint_templates', ['sync_status']);
    await queryInterface.addIndex('fingerprint_templates', ['employee_id', 'device_id', 'finger_number'], { 
      unique: true 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fingerprint_templates');
  }
};
