import { Model, DataTypes } from 'sequelize';

class EmployeeSchedule extends Model {
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
        schedule_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'work_schedules',
            key: 'id',
          },
        },
        effective_from: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        effective_until: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'NULL means indefinitely',
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
        modelName: 'EmployeeSchedule',
        tableName: 'employee_schedules',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['schedule_id'] },
          { fields: ['effective_from'] },
          { fields: ['effective_until'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(models) {
    // EmployeeSchedule belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // EmployeeSchedule belongs to WorkSchedule
    this.belongsTo(models.WorkSchedule, {
      foreignKey: 'schedule_id',
      as: 'schedule',
    });
  }

  // Instance methods
  isEffectiveOn(date) {
    const checkDate = new Date(date);
    const from = new Date(this.effective_from);

    if (checkDate < from) return false;

    if (this.effective_until) {
      const until = new Date(this.effective_until);
      if (checkDate > until) return false;
    }

    return this.is_active;
  }

  isCurrentlyActive() {
    return this.isEffectiveOn(new Date());
  }
}

export default EmployeeSchedule;
