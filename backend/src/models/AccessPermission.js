import { Model, DataTypes, Op } from 'sequelize';

class AccessPermission extends Model {
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
        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id',
          },
        },
        door_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'doors',
            key: 'id',
          },
          comment: 'Specific door (null = all doors on device)',
        },
        device_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'devices',
            key: 'id',
          },
          comment: 'Specific device (null if door_id is specified)',
        },
        timezone_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'access_timezones',
            key: 'id',
          },
          comment: 'When can this employee access this door/device',
        },
        valid_from: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Permission valid from this date',
        },
        valid_until: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          comment: 'Permission valid until this date (null = permanent)',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        access_level: {
          type: DataTypes.ENUM('normal', 'vip', 'emergency', 'temporary', 'contractor'),
          defaultValue: 'normal',
          allowNull: false,
          comment: 'Type of access granted',
        },
        require_pin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Require PIN code in addition to biometric/card',
        },
        pin_code: {
          type: DataTypes.STRING(10),
          allowNull: true,
          comment: 'PIN code if require_pin is true',
        },
        allow_entry: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: 'Allow entry (IN)',
        },
        allow_exit: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
          comment: 'Allow exit (OUT)',
        },
        max_accesses_per_day: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Maximum number of accesses per day (null = unlimited)',
        },
        granted_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          comment: 'User who granted this permission',
        },
        granted_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        sync_status: {
          type: DataTypes.ENUM('pending', 'synced', 'failed'),
          defaultValue: 'pending',
          allowNull: false,
          comment: 'Sync status to device',
        },
        sync_error: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        last_synced_at: {
          type: DataTypes.DATE,
          allowNull: true,
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
        modelName: 'AccessPermission',
        tableName: 'access_permissions',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['employee_id'] },
          { fields: ['door_id'] },
          { fields: ['device_id'] },
          { fields: ['timezone_id'] },
          { fields: ['is_active'] },
          { fields: ['sync_status'] },
          { fields: ['valid_from'] },
          { fields: ['valid_until'] },
          {
            fields: ['employee_id', 'door_id', 'device_id'],
            name: 'unique_employee_access',
          },
        ],
        validate: {
          mustHaveDoorOrDevice() {
            if (!this.door_id && !this.device_id) {
              throw new Error('Must specify either door_id or device_id');
            }
          },
          validDateRange() {
            if (this.valid_until && this.valid_from > this.valid_until) {
              throw new Error('valid_from must be before valid_until');
            }
          },
          pinRequired() {
            if (this.require_pin && !this.pin_code) {
              throw new Error('PIN code is required when require_pin is true');
            }
          },
        },
      }
    );
  }

  static associate(models) {
    // AccessPermission belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // AccessPermission belongs to Employee
    this.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });

    // AccessPermission belongs to Door (optional)
    this.belongsTo(models.Door, {
      foreignKey: 'door_id',
      as: 'door',
    });

    // AccessPermission belongs to Device (optional)
    this.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
    });

    // AccessPermission belongs to AccessTimeZone
    this.belongsTo(models.AccessTimeZone, {
      foreignKey: 'timezone_id',
      as: 'timezone',
    });

    // AccessPermission belongs to User (who granted it)
    this.belongsTo(models.User, {
      foreignKey: 'granted_by',
      as: 'grantor',
    });
  }

  // Instance methods

  /**
   * Check if permission is currently valid (date-wise)
   * @param {Date} checkDate - Date to check (default: today)
   * @returns {boolean}
   */
  isValidOn(checkDate = new Date()) {
    if (!this.is_active) return false;

    const checkDateOnly = new Date(checkDate.toISOString().split('T')[0]);
    const validFrom = new Date(this.valid_from);
    const validUntil = this.valid_until ? new Date(this.valid_until) : null;

    if (checkDateOnly < validFrom) return false;
    if (validUntil && checkDateOnly > validUntil) return false;

    return true;
  }

  /**
   * Check if permission allows access at specific time
   * @param {Date} checkTime - Time to check (default: now)
   * @returns {Promise<boolean>}
   */
  async canAccessAt(checkTime = new Date()) {
    if (!this.isValidOn(checkTime)) return false;

    // Load timezone if not already loaded
    if (!this.timezone) {
      const AccessTimeZone = this.sequelize.models.AccessTimeZone;
      this.timezone = await AccessTimeZone.findByPk(this.timezone_id);
    }

    if (!this.timezone) return false;

    return this.timezone.isAccessAllowedNow(checkTime);
  }

  /**
   * Check if permission is synced to device
   * @returns {boolean}
   */
  isSynced() {
    return this.sync_status === 'synced';
  }

  /**
   * Check if permission needs sync
   * @returns {boolean}
   */
  needsSync() {
    return this.sync_status === 'pending' || this.sync_status === 'failed';
  }

  /**
   * Mark permission as synced
   * @returns {Promise<AccessPermission>}
   */
  async markSynced() {
    this.sync_status = 'synced';
    this.sync_error = null;
    this.last_synced_at = new Date();
    return this.save();
  }

  /**
   * Mark permission as failed to sync
   * @param {string} error - Error message
   * @returns {Promise<AccessPermission>}
   */
  async markSyncFailed(error) {
    this.sync_status = 'failed';
    this.sync_error = error;
    return this.save();
  }

  /**
   * Check if permission is temporary (has expiry date)
   * @returns {boolean}
   */
  isTemporary() {
    return this.valid_until !== null;
  }

  /**
   * Check if permission is expired
   * @returns {boolean}
   */
  isExpired() {
    if (!this.valid_until) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return this.valid_until < today;
  }

  /**
   * Get days until expiry
   * @returns {number|null} Days until expiry, or null if permanent
   */
  daysUntilExpiry() {
    if (!this.valid_until) return null;

    const today = new Date();
    const expiry = new Date(this.valid_until);
    const diff = expiry - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  }

  /**
   * Check if permission is about to expire
   * @param {number} warningDays - Days threshold (default: 7)
   * @returns {boolean}
   */
  isExpiringsoon(warningDays = 7) {
    const days = this.daysUntilExpiry();
    return days !== null && days > 0 && days <= warningDays;
  }

  /**
   * Extend permission validity
   * @param {Date} newExpiryDate - New expiry date
   * @returns {Promise<AccessPermission>}
   */
  async extend(newExpiryDate) {
    this.valid_until = newExpiryDate;
    this.sync_status = 'pending'; // Need to re-sync
    return this.save();
  }

  /**
   * Revoke permission (deactivate)
   * @returns {Promise<AccessPermission>}
   */
  async revoke() {
    this.is_active = false;
    this.sync_status = 'pending'; // Need to sync removal
    return this.save();
  }

  // Static methods

  /**
   * Get all permissions for an employee
   * @param {number} employeeId
   * @param {boolean} activeOnly
   * @returns {Promise<AccessPermission[]>}
   */
  static async getByEmployee(employeeId, activeOnly = true) {
    const where = { employee_id: employeeId };
    if (activeOnly) {
      where.is_active = true;
    }

    return this.findAll({
      where,
      include: [
        { association: 'door' },
        { association: 'device' },
        { association: 'timezone' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Get all permissions for a door
   * @param {number} doorId
   * @param {boolean} activeOnly
   * @returns {Promise<AccessPermission[]>}
   */
  static async getByDoor(doorId, activeOnly = true) {
    const where = { door_id: doorId };
    if (activeOnly) {
      where.is_active = true;
    }

    return this.findAll({
      where,
      include: [
        { association: 'employee' },
        { association: 'timezone' },
      ],
      order: [['employee_id', 'ASC']],
    });
  }

  /**
   * Check if employee can access specific door at specific time
   * @param {number} employeeId
   * @param {number} doorId
   * @param {Date} checkTime
   * @returns {Promise<boolean>}
   */
  static async canEmployeeAccessDoor(employeeId, doorId, checkTime = new Date()) {
    const permissions = await this.findAll({
      where: {
        employee_id: employeeId,
        [Op.or]: [
          { door_id: doorId },
          { 
            device_id: { 
              [Op.in]: this.sequelize.literal(
                `(SELECT device_id FROM doors WHERE id = ${doorId})`
              )
            }
          }
        ],
        is_active: true,
      },
      include: [{ association: 'timezone' }],
    });

    for (const permission of permissions) {
      const canAccess = await permission.canAccessAt(checkTime);
      if (canAccess) return true;
    }

    return false;
  }

  /**
   * Get permissions that need sync
   * @param {number} organizationId
   * @returns {Promise<AccessPermission[]>}
   */
  static async getNeedingSync(organizationId) {
    return this.findAll({
      where: {
        organization_id: organizationId,
        sync_status: { [Op.in]: ['pending', 'failed'] },
        is_active: true,
      },
      include: [
        { association: 'employee' },
        { association: 'door' },
        { association: 'device' },
        { association: 'timezone' },
      ],
    });
  }

  /**
   * Get expiring permissions
   * @param {number} organizationId
   * @param {number} warningDays
   * @returns {Promise<AccessPermission[]>}
   */
  static async getExpiring(organizationId, warningDays = 7) {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);

    return this.findAll({
      where: {
        organization_id: organizationId,
        is_active: true,
        valid_until: {
          [Op.ne]: null,
          [Op.lte]: warningDate,
          [Op.gte]: new Date(),
        },
      },
      include: [
        { association: 'employee' },
        { association: 'door' },
      ],
      order: [['valid_until', 'ASC']],
    });
  }

  /**
   * Get expired permissions (for cleanup)
   * @param {number} organizationId
   * @returns {Promise<AccessPermission[]>}
   */
  static async getExpired(organizationId) {
    return this.findAll({
      where: {
        organization_id: organizationId,
        is_active: true,
        valid_until: {
          [Op.ne]: null,
          [Op.lt]: new Date(),
        },
      },
      include: [
        { association: 'employee' },
      ],
    });
  }

  /**
   * Bulk revoke expired permissions
   * @param {number} organizationId
   * @returns {Promise<number>} Number of permissions revoked
   */
  static async revokeExpired(organizationId) {
    const [count] = await this.update(
      { is_active: false, sync_status: 'pending' },
      {
        where: {
          organization_id: organizationId,
          is_active: true,
          valid_until: {
            [Op.ne]: null,
            [Op.lt]: new Date(),
          },
        },
      }
    );

    return count;
  }
}

export default AccessPermission;
