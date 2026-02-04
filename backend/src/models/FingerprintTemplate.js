import { Model, DataTypes } from 'sequelize';

class FingerprintTemplate extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id',
          },
        },
        device_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'devices',
            key: 'id',
          },
        },
        fingerprint_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Fingerprint ID from device',
        },
        finger_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 10,
          },
          comment: '1-10 for fingers',
        },
        template_data: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'Base64 encoded fingerprint template',
        },
        sync_status: {
          type: DataTypes.ENUM('pending', 'synced', 'failed'),
          defaultValue: 'pending',
          allowNull: false,
        },
        sync_error: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        synced_at: {
          type: DataTypes.DATE,
          allowNull: true,
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
        modelName: 'FingerprintTemplate',
        tableName: 'fingerprint_templates',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['device_id'] },
          { fields: ['employee_id', 'device_id', 'finger_number'], unique: true },
          { fields: ['sync_status'] },
        ],
      }
    );
  }

  static associate(models) {
    // FingerprintTemplate belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // FingerprintTemplate belongs to Device
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });
  }

  // Instance methods
  isSynced() {
    return this.sync_status === 'synced';
  }

  needsSync() {
    return this.sync_status === 'pending' || this.sync_status === 'failed';
  }
}

export default FingerprintTemplate;
