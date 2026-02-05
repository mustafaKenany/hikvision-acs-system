'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('card_templates', {
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
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      card_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      card_type: {
        type: Sequelize.ENUM('rfid', 'nfc', 'qr_code', 'barcode'),
        defaultValue: 'rfid',
        allowNull: false
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
    await queryInterface.addIndex('card_templates', ['employee_id']);
    await queryInterface.addIndex('card_templates', ['device_id']);
    await queryInterface.addIndex('card_templates', ['card_number'], { unique: true });
    await queryInterface.addIndex('card_templates', ['sync_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('card_templates');
  }
};
