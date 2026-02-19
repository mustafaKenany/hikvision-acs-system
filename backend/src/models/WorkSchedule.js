import { Model, DataTypes } from 'sequelize';

class WorkSchedule extends Model {
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
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        start_time: {
          type: DataTypes.TIME,
          allowNull: false,
          comment: 'Work start time (e.g., 08:00:00)',
        },
        end_time: {
          type: DataTypes.TIME,
          allowNull: false,
          comment: 'Work end time (e.g., 17:00:00)',
        },
        work_days: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          allowNull: false,
          defaultValue: [1, 2, 3, 4, 5],
          comment: 'Array of work days (0=Sunday, 6=Saturday)',
        },
        late_grace_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 15,
          comment: 'Grace period for late arrival',
        },
        early_leave_grace_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 15,
          comment: 'Grace period for early departure',
        },
        break_duration: {
          type: DataTypes.INTEGER,
          defaultValue: 60,
          comment: 'Break duration in minutes',
        },
        expected_hours: {
          type: DataTypes.DECIMAL(4, 2),
          defaultValue: 8.0,
          comment: 'Expected daily working hours',
        },
        is_flexible: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: 'Flexible schedule (no fixed times)',
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
        modelName: 'WorkSchedule',
        tableName: 'work_schedules',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(models) {
    // WorkSchedule belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // WorkSchedule has many EmployeeSchedules
    this.hasMany(models.EmployeeSchedule, {
      foreignKey: 'schedule_id',
      as: 'employeeSchedules',
      onDelete: 'CASCADE',
    });
  }

  // Instance methods
  isWorkDay(dayOfWeek) {
    // dayOfWeek: 0 = Sunday, 6 = Saturday
    return this.work_days.includes(dayOfWeek);
  }

  isWorkingNow() {
    const now = new Date();
    const dayOfWeek = now.getDay();

    if (!this.isWorkDay(dayOfWeek)) return false;

    const currentTime = now.toTimeString().slice(0, 8);
    return currentTime >= this.start_time && currentTime <= this.end_time;
  }

  getExpectedHoursForDate(date) {
    const dayOfWeek = new Date(date).getDay();
    return this.isWorkDay(dayOfWeek) ? parseFloat(this.expected_hours) : 0;
  }
}

export default WorkSchedule;
