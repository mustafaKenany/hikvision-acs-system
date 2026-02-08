// backend/src/database/migrations/006-create-push-subscriptions.js
// Migration to create push_subscriptions table

export async function up(queryInterface, Sequelize) {
  const { DataTypes } = Sequelize
  
  await queryInterface.createTable('push_subscriptions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    keys: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_used: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  })

  // Create indexes
  await queryInterface.addIndex('push_subscriptions', ['user_id'])
  await queryInterface.addIndex('push_subscriptions', ['endpoint'], { unique: true })
  await queryInterface.addIndex('push_subscriptions', ['is_active'])

  console.log('✅ Table "push_subscriptions" created successfully')
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('push_subscriptions')
  
  console.log('✅ Table "push_subscriptions" dropped successfully')
}
