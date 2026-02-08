/**
 * Push Subscription Model
 * نموذج اشتراكات الإشعارات
 */

import { Model, DataTypes } from 'sequelize';

class PushSubscription extends Model {
  static init(sequelize) {
    return super.init(
      {
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
          allowNull: false,
          comment: 'Encryption keys (p256dh, auth)'
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
          allowNull: true
        }
      },
      {
        sequelize,
        tableName: 'push_subscriptions',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['user_id']
          },
          {
            fields: ['endpoint'],
            unique: true
          },
          {
            fields: ['is_active']
          }
        ]
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export default PushSubscription;
