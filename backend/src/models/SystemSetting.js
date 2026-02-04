import { Model, DataTypes } from 'sequelize';

class SystemSetting extends Model {
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
          allowNull: true,
          references: {
            model: 'organizations',
            key: 'id',
          },
          comment: 'NULL means global system setting',
        },
        key: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        value: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        value_type: {
          type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'array'),
          defaultValue: 'string',
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'general',
          comment: 'Setting category (e.g., general, email, security)',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        is_public: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: 'Can be accessed without authentication',
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
        modelName: 'SystemSetting',
        tableName: 'system_settings',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['key'] },
          { fields: ['organization_id', 'key'], unique: true },
          { fields: ['category'] },
          { fields: ['is_public'] },
        ],
      }
    );
  }

  static associate(models) {
    // SystemSetting belongs to Organization (optional)
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
  }

  // Static methods
  static async getSetting(key, organizationId = null) {
    const setting = await this.findOne({
      where: {
        key,
        organization_id: organizationId,
      },
    });

    return setting ? setting.getParsedValue() : null;
  }

  static async setSetting(key, value, organizationId = null, options = {}) {
    const { category = 'general', description = '', isPublic = false } = options;

    let valueType = 'string';
    let stringValue = value;

    if (typeof value === 'boolean') {
      valueType = 'boolean';
      stringValue = value.toString();
    } else if (typeof value === 'number') {
      valueType = 'number';
      stringValue = value.toString();
    } else if (Array.isArray(value)) {
      valueType = 'array';
      stringValue = JSON.stringify(value);
    } else if (typeof value === 'object') {
      valueType = 'json';
      stringValue = JSON.stringify(value);
    }

    const [setting] = await this.upsert({
      organization_id: organizationId,
      key,
      value: stringValue,
      value_type: valueType,
      category,
      description,
      is_public: isPublic,
    });

    return setting;
  }

  // Instance methods
  getParsedValue() {
    if (!this.value) return null;

    switch (this.value_type) {
      case 'boolean':
        return this.value === 'true';
      case 'number':
        return parseFloat(this.value);
      case 'json':
      case 'array':
        try {
          return JSON.parse(this.value);
        } catch (e) {
          return this.value;
        }
      default:
        return this.value;
    }
  }

  setValue(newValue) {
    let valueType = 'string';
    let stringValue = newValue;

    if (typeof newValue === 'boolean') {
      valueType = 'boolean';
      stringValue = newValue.toString();
    } else if (typeof newValue === 'number') {
      valueType = 'number';
      stringValue = newValue.toString();
    } else if (Array.isArray(newValue)) {
      valueType = 'array';
      stringValue = JSON.stringify(newValue);
    } else if (typeof newValue === 'object') {
      valueType = 'json';
      stringValue = JSON.stringify(newValue);
    }

    this.value = stringValue;
    this.value_type = valueType;

    return this;
  }
}

export default SystemSetting;
