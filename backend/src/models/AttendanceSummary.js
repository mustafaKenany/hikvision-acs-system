import { Model, DataTypes } from 'sequelize';

class AttendanceSummary extends Model {
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
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        check_in_time: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        check_out_time: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'holiday', 'leave'),
          defaultValue: 'absent',
          allowNull: false,
        },
        is_late: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        late_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        is_early_leave: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        early_leave_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        working_hours: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0,
          comment: 'Total working hours',
        },
        overtime_hours: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0,
        },
        break_hours: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0,
        },
        notes: {
          type: DataTypes.TEXT,
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
        modelName: 'AttendanceSummary',
        tableName: 'attendance_summary',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['date'] },
          { fields: ['employee_id', 'date'], unique: true },
          { fields: ['status'] },
          { fields: ['is_late'] },
        ],
      }
    );
  }

  static associate(models) {
    // AttendanceSummary belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });
  }

  // Instance methods
  calculateWorkingHours() {
    if (!this.check_in_time || !this.check_out_time) return 0;

    const checkIn = new Date(this.check_in_time);
    const checkOut = new Date(this.check_out_time);

    const diffMs = checkOut - checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);

    // Subtract break hours
    const netHours = diffHours - (parseFloat(this.break_hours) || 0);

    return Math.max(0, Math.round(netHours * 100) / 100);
  }

  isFullDay(expectedHours = 8) {
    return this.working_hours >= expectedHours;
  }

  isHalfDay(expectedHours = 8) {
    return this.working_hours >= expectedHours / 2 && this.working_hours < expectedHours;
  }
}

export default AttendanceSummary;
