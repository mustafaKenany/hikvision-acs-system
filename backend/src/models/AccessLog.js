/**
 * AccessLog Model
 * نموذج سجلات الدخول والخروج من الأجهزة
 */

import { Model, DataTypes } from 'sequelize';

class AccessLog extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        device_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'devices',
            key: 'id',
          },
          comment: 'Device that logged the access event',
        },
        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'employees',
            key: 'id',
          },
          comment: 'Employee associated with the access (null if not found)',
        },
        employee_no: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: 'Employee number from device',
        },
        employee_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'Employee name (from Employee record or device)',
        },
        log_type: {
          type: DataTypes.ENUM('check_in', 'check_out', 'unknown'),
          defaultValue: 'unknown',
          allowNull: false,
          comment: 'Type of access event',
        },
        verification_method: {
          type: DataTypes.ENUM('face', 'fingerprint', 'card', 'password', 'unknown'),
          defaultValue: 'unknown',
          allowNull: false,
          comment: 'Method used for verification',
        },
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: 'Time of access event',
        },
        temperature: {
          type: DataTypes.DECIMAL(4, 1),
          allowNull: true,
          comment: 'Body temperature if device supports it (Celsius)',
        },
        mask_detection: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          comment: 'Whether mask was detected (if supported)',
        },
        photo_url: {
          type: DataTypes.STRING(512),
          allowNull: true,
          comment: 'URL/path to captured photo during access',
        },
        door_number: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 1,
          comment: 'Door/reader number on device',
        },
        event_type: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Device event type code',
        },
        raw_data: {
          type: DataTypes.JSONB,
          allowNull: true,
          comment: 'Raw JSON data from device',
        },
        sync_status: {
          type: DataTypes.ENUM('synced', 'pending', 'failed'),
          defaultValue: 'synced',
          allowNull: false,
          comment: 'Sync status from device',
        },
        is_deleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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
        tableName: 'access_logs',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
          {
            fields: ['device_id'],
          },
          {
            fields: ['employee_id'],
          },
          {
            fields: ['employee_no'],
          },
          {
            fields: ['timestamp'],
          },
          {
            fields: ['log_type'],
          },
          {
            fields: ['verification_method'],
          },
          {
            fields: ['sync_status'],
          },
          {
            fields: ['is_deleted'],
          },
        ],
      }
    );
  }

  static associate(models) {
    // Many-to-One with Device
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });

    // Many-to-One with Employee (optional)
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });
  }
}

export default AccessLog;
