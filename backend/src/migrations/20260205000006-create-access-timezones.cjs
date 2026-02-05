'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_timezones', {
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
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      time_segments: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
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
    await queryInterface.addIndex('access_timezones', ['organization_id']);
    await queryInterface.addIndex('access_timezones', ['name']);
    await queryInterface.addIndex('access_timezones', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('access_timezones');
  }
};
