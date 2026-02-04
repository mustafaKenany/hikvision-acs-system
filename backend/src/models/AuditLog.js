import { Model, DataTypes } from 'sequelize';

class AuditLog extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: 'Action performed (e.g., create, update, delete)',
        },
        resource_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: 'Type of resource (e.g., employee, device, user)',
        },
        resource_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'ID of the affected resource',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        old_values: {
          type: DataTypes.JSONB,
          allowNull: true,
          comment: 'Previous values before change',
        },
        new_values: {
          type: DataTypes.JSONB,
          allowNull: true,
          comment: 'New values after change',
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: false,
        underscored: true,
        indexes: [
          { fields: ['user_id'] },
          { fields: ['action'] },
          { fields: ['resource_type'] },
          { fields: ['resource_id'] },
          { fields: ['created_at'] },
        ],
      }
    );
  }

  static associate(models) {
    // AuditLog belongs to User
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }

  // Static methods
  static async logAction(data) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    } = data;

    return this.create({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  // Instance methods
  getChangesSummary() {
    if (!this.old_values || !this.new_values) return [];

    const changes = [];
    const allKeys = new Set([
      ...Object.keys(this.old_values),
      ...Object.keys(this.new_values),
    ]);

    allKeys.forEach(key => {
      const oldVal = this.old_values[key];
      const newVal = this.new_values[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          old: oldVal,
          new: newVal,
        });
      }
    });

    return changes;
  }
}

export default AuditLog;
