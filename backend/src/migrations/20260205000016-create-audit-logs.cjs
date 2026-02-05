'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.ENUM('create', 'read', 'update', 'delete', 'login', 'logout'),
        allowNull: false
      },
      resource_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      resource_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['resource_type']);
    await queryInterface.addIndex('audit_logs', ['resource_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['resource_type', 'resource_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
  }
};
