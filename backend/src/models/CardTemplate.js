import { Model, DataTypes } from 'sequelize';

class CardTemplate extends Model {
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
          allowNull: true,
          references: {
            model: 'devices',
            key: 'id',
          },
          comment: 'NULL means card works on all devices',
        },
        card_number: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        card_type: {
          type: DataTypes.ENUM('rfid', 'nfc', 'qr_code', 'barcode'),
          defaultValue: 'rfid',
          allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        valid_from: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        valid_until: {
          type: DataTypes.DATE,
          allowNull: true,
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
        synced_at: {
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
        modelName: 'CardTemplate',
        tableName: 'card_templates',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['employee_id'] },
          { fields: ['device_id'] },
          { fields: ['card_number'], unique: true },
          { fields: ['is_active'] },
          { fields: ['sync_status'] },
        ],
      }
    );
  }

  static associate(models) {
    // CardTemplate belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // CardTemplate belongs to Device (optional)
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });
  }

  // Instance methods
  isValid() {
    if (!this.is_active) return false;

    const now = new Date();

    if (this.valid_from && new Date(this.valid_from) > now) {
      return false;
    }

    if (this.valid_until && new Date(this.valid_until) < now) {
      return false;
    }

    return true;
  }

  isSynced() {
    return this.sync_status === 'synced';
  }
}

export default CardTemplate;
