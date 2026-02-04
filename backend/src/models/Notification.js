import { Model, DataTypes } from 'sequelize';

class Notification extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        organization_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'organizations',
            key: 'id',
          },
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          comment: 'NULL means notification for all users in org',
        },
        type: {
          type: DataTypes.ENUM(
            'attendance',
            'late_arrival',
            'absence',
            'device_offline',
            'device_online',
            'sync_error',
            'system',
            'other'
          ),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        priority: {
          type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
          defaultValue: 'normal',
          allowNull: false,
        },
        is_read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        read_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        data: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Additional notification data',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['user_id'] },
          { fields: ['type'] },
          { fields: ['is_read'] },
          { fields: ['priority'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(models) {
    // Notification belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // Notification belongs to User (optional)
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }

  // Instance methods
  markAsRead() {
    this.is_read = true;
    this.read_at = new Date();
    return this.save();
  }

  isUnread() {
    return !this.is_read;
  }

  isHighPriority() {
    return this.priority === 'high' || this.priority === 'urgent';
  }
}

export default Notification;
