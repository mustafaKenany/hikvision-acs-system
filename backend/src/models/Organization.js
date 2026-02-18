import { Model, DataTypes } from 'sequelize';

class Organization extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [2, 255],
          },
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
          validate: {
            is: /^[0-9+\s()-]+$/,
          },
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        subscription_plan: {
          type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
          defaultValue: 'free',
          allowNull: false,
        },
        subscription_start: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        subscription_end: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        max_employees: {
          type: DataTypes.INTEGER,
          defaultValue: 10,
          allowNull: false,
        },
        max_devices: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
          allowNull: false,
        },
        storage_limit_mb: {
          type: DataTypes.INTEGER,
          defaultValue: 100,
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        settings: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
        logo_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'URL of organization logo image',
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
        modelName: 'Organization',
        tableName: 'organizations',
        timestamps: true,
        underscored: true,
        // Indexes are managed by migrations (20260215-add-organization-indexes.js)
        // This prevents Sequelize from creating duplicate indexes
        indexes: []
      }
    );
  }

  static associate(models) {
    // Organization has many Users
    this.hasMany(models.User, {
      foreignKey: 'organization_id',
      as: 'users',
      onDelete: 'CASCADE',
    });

    // Organization has many Devices
    this.hasMany(models.Device, {
      foreignKey: 'organization_id',
      as: 'devices',
      onDelete: 'CASCADE',
    });

    // Organization has many Employees
    this.hasMany(models.Employee, {
      foreignKey: 'organization_id',
      as: 'employees',
      onDelete: 'CASCADE',
    });

    // Organization has many WorkSchedules
    this.hasMany(models.WorkSchedule, {
      foreignKey: 'organization_id',
      as: 'workSchedules',
      onDelete: 'CASCADE',
    });

    // Organization has many Notifications
    this.hasMany(models.Notification, {
      foreignKey: 'organization_id',
      as: 'notifications',
      onDelete: 'CASCADE',
    });

    // Organization has many SystemSettings
    this.hasMany(models.SystemSetting, {
      foreignKey: 'organization_id',
      as: 'systemSettings',
      onDelete: 'CASCADE',
    });
  }

  // Instance methods
  isSubscriptionActive() {
    if (!this.subscription_end) return false;
    return new Date() <= new Date(this.subscription_end);
  }

  canAddEmployee() {
    // Will be checked in service layer with actual count
    return this.is_active && this.isSubscriptionActive();
  }

  canAddDevice() {
    return this.is_active && this.isSubscriptionActive();
  }
}

export default Organization;
