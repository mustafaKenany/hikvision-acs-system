import { Model, DataTypes } from 'sequelize';

class Employee extends Model {
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
        employee_no: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: 'Unique employee number',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: {
            name: 'unique_employee_name',
            msg: 'الاسم موجود مسبقاً، الرجاء إدخال اسم مختلف'
          },
          validate: {
            notEmpty: true,
          },
        },
        name_ar: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'Arabic name',
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: {
            name: 'unique_employee_email',
            msg: 'البريد الإلكتروني مستخدم مسبقاً'
          },
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
          unique: {
            name: 'unique_employee_phone',
            msg: 'رقم الهاتف مستخدم مسبقاً'
          },
        },
        department: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        position: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Job title/position',
        },
        photo_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: 'Profile photo URL',
        },
        hire_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Additional employee data',
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
        modelName: 'Employee',
        tableName: 'employees',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['employee_no'] },
          { fields: ['organization_id', 'employee_no'], unique: true },
          { fields: ['department'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(models) {
    // Employee belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // Employee has many FaceTemplates
    this.hasMany(models.FaceTemplate, {
      foreignKey: 'employee_id',
      as: 'faces',
      onDelete: 'CASCADE',
    });

    // Employee has many CardTemplates
    this.hasMany(models.CardTemplate, {
      foreignKey: 'employee_id',
      as: 'cards',
      onDelete: 'CASCADE',
    });

    // Employee has many FingerprintTemplates
    this.hasMany(models.FingerprintTemplate, {
      foreignKey: 'employee_id',
      as: 'fingerprints',
      onDelete: 'CASCADE',
    });

    // Employee has many AttendanceLogs
    this.hasMany(models.AttendanceLog, {
      foreignKey: 'employee_id',
      as: 'attendanceLogs',
    });

    // Employee has many AttendanceSummaries
    this.hasMany(models.AttendanceSummary, {
      foreignKey: 'employee_id',
      as: 'attendanceSummaries',
    });

    // Employee has many EmployeeSchedules
    this.hasMany(models.EmployeeSchedule, {
      foreignKey: 'employee_id',
      as: 'schedules',
      onDelete: 'CASCADE',
    });
  }

  // Instance methods
  getFullName() {
    return this.name_ar || this.name;
  }

  hasActiveSchedule() {
    // Will be checked in service layer
    return true;
  }

  toJSON() {
    const values = { ...this.get() };
    return values;
  }
}

export default Employee;
