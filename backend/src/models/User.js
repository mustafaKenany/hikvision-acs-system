import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
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
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
            len: [8, 255],
          },
        },
        role: {
          type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'viewer'),
          defaultValue: 'viewer',
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reset_password_token: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        reset_password_expires: {
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
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['email'], unique: true },
          { fields: ['organization_id'] },
          { fields: ['role'] },
          { fields: ['is_active'] },
        ],
        hooks: {
          beforeCreate: async (user) => {
            if (user.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              user.password = await bcrypt.hash(user.password, 10);
            }
          },
        },
      }
    );
  }

  static associate(models) {
    // User belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // User has many AuditLogs
    this.hasMany(models.AuditLog, {
      foreignKey: 'user_id',
      as: 'auditLogs',
    });
  }

  // Instance methods
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.reset_password_token;
    delete values.reset_password_expires;
    return values;
  }

  hasPermission(action) {
    const permissions = {
      super_admin: ['*'],
      admin: [
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'employees:*',
        'devices:*',
        'attendance:*',
        'reports:*',
        'settings:*',
      ],
      manager: [
        'users:read',
        'employees:read',
        'employees:create',
        'employees:update',
        'devices:read',
        'attendance:*',
        'reports:read',
      ],
      viewer: ['employees:read', 'attendance:read', 'reports:read'],
    };

    const userPermissions = permissions[this.role] || [];

    if (userPermissions.includes('*')) return true;
    if (userPermissions.includes(action)) return true;

    const [resource, operation] = action.split(':');
    if (userPermissions.includes(`${resource}:*`)) return true;

    return false;
  }
}

export default User;
