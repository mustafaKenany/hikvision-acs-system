import { Model, DataTypes } from 'sequelize';

class Device extends Model {
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
          },
        },
        device_type: {
          type: DataTypes.ENUM('face_recognition', 'card_reader', 'fingerprint', 'hybrid'),
          defaultValue: 'face_recognition',
          allowNull: false,
        },
        model: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: 'Device model (e.g., DS-K1T673DG1X-E1)',
        },
        serial_number: {
          type: DataTypes.STRING(100),
          allowNull: true,
          unique: true,
        },
        mac_address: {
          type: DataTypes.STRING(17),
          allowNull: true,
          unique: true,
          validate: {
            is: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
          },
          comment: 'MAC Address (e.g., 00:11:22:33:44:55)',
        },
        ip_address: {
          type: DataTypes.STRING(45),
          allowNull: false,
          validate: {
            isIP: true,
          },
        },
        port: {
          type: DataTypes.INTEGER,
          defaultValue: 80,
          allowNull: false,
          validate: {
            min: 1,
            max: 65535,
          },
        },
        username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: 'admin',
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'Physical location (e.g., Main Gate, Building A)',
        },
        firmware_version: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        max_faces: {
          type: DataTypes.INTEGER,
          defaultValue: 3000,
          allowNull: true,
        },
        max_cards: {
          type: DataTypes.INTEGER,
          defaultValue: 10000,
          allowNull: true,
        },
        max_fingerprints: {
          type: DataTypes.INTEGER,
          defaultValue: 3000,
          allowNull: true,
        },
        is_online: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        last_seen: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_sync: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'Last successful data sync',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        capabilities: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Device capabilities from ISAPI',
        },
        settings: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Device-specific settings',
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
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'Soft delete timestamp',
        },
        deleted_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          comment: 'User who deleted this device',
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        updated_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        modelName: 'Device',
        tableName: 'devices',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['serial_number'], unique: true },
          { fields: ['ip_address'] },
          { fields: ['is_online'] },
          { fields: ['is_active'] },
          { fields: ['deleted_at'] },
        ],
      }
    );
  }

  static associate(models) {
    // Device belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // Device has many FaceTemplates
    this.hasMany(models.FaceTemplate, {
      foreignKey: 'device_id',
      as: 'faces',
      onDelete: 'CASCADE',
    });

    // Device has many CardTemplates
    this.hasMany(models.CardTemplate, {
      foreignKey: 'device_id',
      as: 'cards',
      onDelete: 'CASCADE',
    });

    // Device has many FingerprintTemplates
    this.hasMany(models.FingerprintTemplate, {
      foreignKey: 'device_id',
      as: 'fingerprints',
      onDelete: 'CASCADE',
    });

    // Device has many AttendanceLogs
    this.hasMany(models.AttendanceLog, {
      foreignKey: 'device_id',
      as: 'attendanceLogs',
    });
  }

  // Instance methods
  getConnectionUrl() {
    return `http://${this.ip_address}:${this.port}`;
  }

  getISAPIUrl(endpoint) {
    return `${this.getConnectionUrl()}/ISAPI${endpoint}`;
  }

  isOnline() {
    if (!this.last_seen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(this.last_seen) > fiveMinutesAgo;
  }

  needsSync() {
    if (!this.last_sync) return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(this.last_sync) < oneHourAgo;
  }

  toJSON() {
    const values = { ...this.get() };
    // Don't expose password in API responses
    delete values.password;
    return values;
  }
}

export default Device;
