import { Model, DataTypes } from 'sequelize';

class FaceTemplate extends Model {
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
        face_id: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'Face ID from device (FDID)',
        },
        image_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'Uploaded face image URL',
        },
        quality_score: {
          type: DataTypes.INTEGER,
          allowNull: true,
          validate: {
            min: 0,
            max: 100,
          },
          comment: 'Face template quality score (0-100)',
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
        last_synced_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
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
        modelName: 'FaceTemplate',
        tableName: 'face_templates',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['device_id'] },
          { fields: ['employee_id', 'device_id'], unique: true },
          { fields: ['sync_status'] },
        ],
      }
    );
  }

  static associate(models) {
    // FaceTemplate belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // FaceTemplate belongs to Device
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

export default FaceTemplate;
