'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_settings', {
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
      key: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      value_type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json', 'array'),
        defaultValue: 'string',
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_public: {
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

    // Indexes
    await queryInterface.addIndex('system_settings', ['organization_id']);
    await queryInterface.addIndex('system_settings', ['key']);
    await queryInterface.addIndex('system_settings', ['organization_id', 'key'], { unique: true });
    await queryInterface.addIndex('system_settings', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('system_settings');
  }
};
