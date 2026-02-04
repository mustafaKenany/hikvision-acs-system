import { Model, DataTypes } from 'sequelize';

class Door extends Model {
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
        device_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'devices',
            key: 'id',
          },
          comment: 'The device controlling this door',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
          comment: 'e.g., "Main Entrance", "Server Room", "Building A - Floor 2"',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'Physical location or building/floor information',
        },
        door_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: 1,
            max: 4,
          },
          comment: 'Door number on the device (1-4, some devices support multiple doors)',
        },
        door_type: {
          type: DataTypes.ENUM('automatic', 'manual', 'turnstile', 'gate', 'barrier'),
          defaultValue: 'automatic',
          allowNull: false,
        },
        unlock_mode: {
          type: DataTypes.ENUM('normal', 'always_open', 'always_closed'),
          defaultValue: 'normal',
          allowNull: false,
          comment: 'Door operation mode',
        },
        unlock_duration: {
          type: DataTypes.INTEGER,
          defaultValue: 5,
          allowNull: false,
          validate: {
            min: 1,
            max: 255,
          },
          comment: 'Duration in seconds the door remains unlocked after valid access',
        },
        door_held_alarm_timeout: {
          type: DataTypes.INTEGER,
          defaultValue: 30,
          allowNull: false,
          validate: {
            min: 0,
            max: 255,
          },
          comment: 'Seconds before door-held-open alarm triggers (0 = disabled)',
        },
        door_open_timeout: {
          type: DataTypes.INTEGER,
          defaultValue: 60,
          allowNull: false,
          validate: {
            min: 0,
            max: 255,
          },
          comment: 'Maximum time door can remain open (0 = disabled)',
        },
        magnetic_lock: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: 'Whether door uses magnetic lock or electric strike',
        },
        door_sensor: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: 'Whether door has open/close sensor installed',
        },
        exit_button: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: 'Whether door has exit button for leaving without authentication',
        },
        two_person_rule: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Require two authorized persons to unlock (high security areas)',
        },
        anti_passback: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Prevent re-entry without exit (requires entry/exit readers)',
        },
        is_emergency_door: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Emergency exit door (may have special unlock rules)',
        },
        door_status: {
          type: DataTypes.ENUM('closed', 'open', 'locked', 'unlocked', 'alarm', 'unknown'),
          defaultValue: 'unknown',
          allowNull: false,
          comment: 'Current door status (updated from device)',
        },
        last_status_update: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'Last time door status was updated from device',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        settings: {
          type: DataTypes.JSONB,
          defaultValue: {},
          comment: 'Additional door-specific settings',
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
        modelName: 'Door',
        tableName: 'doors',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['device_id'] },
          { fields: ['name'] },
          { fields: ['is_active'] },
          { fields: ['door_status'] },
          { 
            fields: ['device_id', 'door_number'],
            unique: true,
            name: 'unique_device_door_number'
          },
        ],
      }
    );
  }

  static associate(models) {
    // Door belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // Door belongs to Device
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });

    // Door has many AccessPermissions
    this.hasMany(models.AccessPermission, {
      foreignKey: 'door_id',
      as: 'permissions',
    });

    // Door has many AttendanceLogs (optional, for tracking door access)
    this.hasMany(models.AttendanceLog, {
      foreignKey: 'door_id',
      as: 'accessLogs',
    });
  }

  // Instance methods

  /**
   * Check if door is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.door_status === 'open' || this.door_status === 'unlocked';
  }

  /**
   * Check if door is in alarm state
   * @returns {boolean}
   */
  isInAlarm() {
    return this.door_status === 'alarm';
  }

  /**
   * Check if door is locked
   * @returns {boolean}
   */
  isLocked() {
    return this.door_status === 'locked' || this.door_status === 'closed';
  }

  /**
   * Check if door is in always-open mode
   * @returns {boolean}
   */
  isAlwaysOpen() {
    return this.unlock_mode === 'always_open';
  }

  /**
   * Check if door is in always-closed mode
   * @returns {boolean}
   */
  isAlwaysClosed() {
    return this.unlock_mode === 'always_closed';
  }

  /**
   * Check if door requires two-person authentication
   * @returns {boolean}
   */
  requiresTwoPersons() {
    return this.two_person_rule === true;
  }

  /**
   * Check if door has anti-passback enabled
   * @returns {boolean}
   */
  hasAntiPassback() {
    return this.anti_passback === true;
  }

  /**
   * Get door full name with location
   * @returns {string}
   */
  getFullName() {
    if (this.location) {
      return `${this.name} (${this.location})`;
    }
    return this.name;
  }

  /**
   * Update door status from device
   * @param {string} status - Door status
   * @returns {Promise<Door>}
   */
  async updateStatus(status) {
    this.door_status = status;
    this.last_status_update = new Date();
    return this.save();
  }

  /**
   * Set door to always-open mode
   * @returns {Promise<Door>}
   */
  async setAlwaysOpen() {
    this.unlock_mode = 'always_open';
    return this.save();
  }

  /**
   * Set door to always-closed mode
   * @returns {Promise<Door>}
   */
  async setAlwaysClosed() {
    this.unlock_mode = 'always_closed';
    return this.save();
  }

  /**
   * Set door to normal mode
   * @returns {Promise<Door>}
   */
  async setNormalMode() {
    this.unlock_mode = 'normal';
    return this.save();
  }

  /**
   * Remote unlock door (temporary unlock)
   * This would trigger ISAPI call in controller
   * @returns {object} Command object for controller
   */
  getUnlockCommand() {
    return {
      action: 'unlock',
      door_id: this.id,
      device_id: this.device_id,
      door_number: this.door_number,
      duration: this.unlock_duration,
    };
  }

  /**
   * Remote lock door
   * @returns {object} Command object for controller
   */
  getLockCommand() {
    return {
      action: 'lock',
      door_id: this.id,
      device_id: this.device_id,
      door_number: this.door_number,
    };
  }

  /**
   * Check if door status is stale (not updated recently)
   * @param {number} minutes - Minutes threshold (default: 5)
   * @returns {boolean}
   */
  isStatusStale(minutes = 5) {
    if (!this.last_status_update) return true;
    
    const staleThreshold = new Date(Date.now() - minutes * 60 * 1000);
    return this.last_status_update < staleThreshold;
  }

  // Static methods

  /**
   * Get all doors for a specific device
   * @param {number} deviceId
   * @returns {Promise<Door[]>}
   */
  static async getByDevice(deviceId) {
    return this.findAll({
      where: { device_id: deviceId, is_active: true },
      order: [['door_number', 'ASC']],
    });
  }

  /**
   * Get all doors in alarm state
   * @param {number} organizationId
   * @returns {Promise<Door[]>}
   */
  static async getDoorsInAlarm(organizationId) {
    return this.findAll({
      where: {
        organization_id: organizationId,
        door_status: 'alarm',
        is_active: true,
      },
      include: [
        { association: 'device' },
      ],
    });
  }

  /**
   * Get all doors with stale status
   * @param {number} organizationId
   * @param {number} minutes
   * @returns {Promise<Door[]>}
   */
  static async getDoorsWithStaleStatus(organizationId, minutes = 5) {
    const staleThreshold = new Date(Date.now() - minutes * 60 * 1000);
    
    return this.findAll({
      where: {
        organization_id: organizationId,
        is_active: true,
      },
      include: [
        { association: 'device' },
      ],
    }).then(doors => doors.filter(door => door.isStatusStale(minutes)));
  }
}

export default Door;
