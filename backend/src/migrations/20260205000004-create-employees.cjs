'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employees', {
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
      employee_no: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name_ar: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
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
    await queryInterface.addIndex('employees', ['organization_id']);
    await queryInterface.addIndex('employees', ['employee_no']);
    await queryInterface.addIndex('employees', ['organization_id', 'employee_no'], { unique: true });
    await queryInterface.addIndex('employees', ['department']);
    await queryInterface.addIndex('employees', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees');
  }
};
