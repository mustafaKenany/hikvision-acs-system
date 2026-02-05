'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
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
        type: Sequelize.STRING(255),
        allowNull: false
      },
      device_type: {
        type: Sequelize.ENUM('face_recognition', 'card_reader', 'fingerprint', 'hybrid'),
        defaultValue: 'face_recognition',
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      mac_address: {
        type: Sequelize.STRING(17),
        allowNull: true,
        unique: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      port: {
        type: Sequelize.INTEGER,
        defaultValue: 80,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'admin'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      firmware_version: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      max_faces: {
        type: Sequelize.INTEGER,
        defaultValue: 3000,
        allowNull: true
      },
      max_cards: {
        type: Sequelize.INTEGER,
        defaultValue: 10000,
        allowNull: true
      },
      max_fingerprints: {
        type: Sequelize.INTEGER,
        defaultValue: 3000,
        allowNull: true
      },
      is_online: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_sync: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      capabilities: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
    await queryInterface.addIndex('devices', ['organization_id']);
    await queryInterface.addIndex('devices', ['serial_number'], { unique: true });
    await queryInterface.addIndex('devices', ['mac_address'], { unique: true });
    await queryInterface.addIndex('devices', ['ip_address']);
    await queryInterface.addIndex('devices', ['is_online']);
    await queryInterface.addIndex('devices', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('devices');
  }
};
