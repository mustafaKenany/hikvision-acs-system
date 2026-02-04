import { Model, DataTypes } from 'sequelize';

class AttendanceLog extends Model {
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
        event_time: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        event_type: {
          type: DataTypes.ENUM('check_in', 'check_out', 'break_start', 'break_end'),
          allowNull: false,
        },
        verification_method: {
          type: DataTypes.ENUM('face', 'card', 'fingerprint', 'qr_code', 'manual'),
          allowNull: false,
        },
        is_successful: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        photo_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'Captured photo during event',
        },
        temperature: {
          type: DataTypes.DECIMAL(4, 1),
          allowNull: true,
          comment: 'Body temperature if measured',
        },
        source: {
          type: DataTypes.ENUM('device', 'manual', 'api'),
          defaultValue: 'device',
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Additional event data',
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
        modelName: 'AttendanceLog',
        tableName: 'attendance_logs',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['device_id'] },
          { fields: ['event_time'] },
          { fields: ['event_type'] },
          { fields: ['employee_id', 'event_time'] },
          { fields: ['is_successful'] },
          { fields: ['source'] },
        ],
      }
    );
  }

  static associate(models) {
    // AttendanceLog belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // AttendanceLog belongs to Device
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });
  }

  // Instance methods
  isLate(schedule) {
    if (!schedule || this.event_type !== 'check_in') return false;

    const eventTime = new Date(this.event_time);
    const scheduleTime = new Date(schedule.start_time);
    const graceMinutes = schedule.late_grace_minutes || 0;

    const lateCutoff = new Date(
      scheduleTime.getTime() + graceMinutes * 60 * 1000
    );

    return eventTime > lateCutoff;
  }

  isEarlyLeave(schedule) {
    if (!schedule || this.event_type !== 'check_out') return false;

    const eventTime = new Date(this.event_time);
    const scheduleTime = new Date(schedule.end_time);
    const graceMinutes = schedule.early_leave_grace_minutes || 0;

    const earlyCutoff = new Date(
      scheduleTime.getTime() - graceMinutes * 60 * 1000
    );

    return eventTime < earlyCutoff;
  }
}

export default AttendanceLog;
