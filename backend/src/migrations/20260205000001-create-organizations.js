'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'basic', 'pro', 'enterprise'),
        defaultValue: 'free',
        allowNull: false
      },
      subscription_start: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      subscription_end: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      max_employees: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
        allowNull: false
      },
      max_devices: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      storage_limit_mb: {
        type: Sequelize.INTEGER,
        defaultValue: 1024,
        allowNull: false
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
    await queryInterface.addIndex('organizations', ['email'], { unique: true });
    await queryInterface.addIndex('organizations', ['subscription_plan']);
    await queryInterface.addIndex('organizations', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organizations');
  }
};
