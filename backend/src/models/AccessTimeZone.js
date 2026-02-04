import { Model, DataTypes } from 'sequelize';

class AccessTimeZone extends Model {
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
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
          comment: 'e.g., "24/7 Access", "Business Hours", "Night Shift"',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        time_segments: {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: [],
          comment: 'Array of time segments: [{day_of_week: 0-6, start_time: "HH:MM", end_time: "HH:MM"}]',
          validate: {
            isValidSegments(value) {
              if (!Array.isArray(value)) {
                throw new Error('time_segments must be an array');
              }
              
              for (const segment of value) {
                if (!segment.day_of_week && segment.day_of_week !== 0) {
                  throw new Error('Each segment must have day_of_week (0-6)');
                }
                if (segment.day_of_week < 0 || segment.day_of_week > 6) {
                  throw new Error('day_of_week must be between 0 (Sunday) and 6 (Saturday)');
                }
                if (!segment.start_time || !segment.end_time) {
                  throw new Error('Each segment must have start_time and end_time');
                }
                // Validate time format HH:MM
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(segment.start_time) || !timeRegex.test(segment.end_time)) {
                  throw new Error('Time must be in HH:MM format (00:00 - 23:59)');
                }
              }
            },
          },
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
        modelName: 'AccessTimeZone',
        tableName: 'access_timezones',
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ['organization_id'] },
          { fields: ['name'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }

  static associate(models) {
    // AccessTimeZone belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });

    // AccessTimeZone has many AccessPermissions
    this.hasMany(models.AccessPermission, {
      foreignKey: 'timezone_id',
      as: 'permissions',
    });
  }

  // Instance methods

  /**
   * Check if current time is within allowed access time
   * @param {Date} checkTime - Time to check (default: now)
   * @returns {boolean}
   */
  isAccessAllowedNow(checkTime = new Date()) {
    if (!this.is_active) return false;

    const dayOfWeek = checkTime.getDay(); // 0 = Sunday, 6 = Saturday
    const currentMinutes = checkTime.getHours() * 60 + checkTime.getMinutes();

    // Find segments for current day
    const todaySegments = this.time_segments.filter(
      (segment) => segment.day_of_week === dayOfWeek
    );

    if (todaySegments.length === 0) return false;

    // Check if current time is within any segment
    return todaySegments.some((segment) => {
      const [startH, startM] = segment.start_time.split(':').map(Number);
      const [endH, endM] = segment.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  }

  /**
   * Check if a specific day has access
   * @param {number} dayOfWeek - 0 (Sunday) to 6 (Saturday)
   * @returns {boolean}
   */
  hasAccessOnDay(dayOfWeek) {
    return this.time_segments.some((segment) => segment.day_of_week === dayOfWeek);
  }

  /**
   * Get access hours for a specific day
   * @param {number} dayOfWeek - 0 (Sunday) to 6 (Saturday)
   * @returns {Array} Array of time segments for the day
   */
  getAccessHoursForDay(dayOfWeek) {
    return this.time_segments.filter((segment) => segment.day_of_week === dayOfWeek);
  }

  /**
   * Check if this is a 24/7 access timezone
   * @returns {boolean}
   */
  is24x7() {
    // Check if all 7 days have 00:00 to 23:59 access
    if (this.time_segments.length !== 7) return false;

    const allDays = [0, 1, 2, 3, 4, 5, 6];
    return allDays.every((day) => {
      const segments = this.time_segments.filter((s) => s.day_of_week === day);
      return segments.some(
        (s) =>
          (s.start_time === '00:00' && s.end_time === '23:59') ||
          (s.start_time === '00:00' && s.end_time === '00:00')
      );
    });
  }

  /**
   * Get human-readable description of access times
   * @returns {string}
   */
  getAccessDescription() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    if (this.is24x7()) {
      return '24/7 Access - الدخول على مدار الساعة';
    }

    const groupedByDay = {};
    this.time_segments.forEach((segment) => {
      if (!groupedByDay[segment.day_of_week]) {
        groupedByDay[segment.day_of_week] = [];
      }
      groupedByDay[segment.day_of_week].push(`${segment.start_time} - ${segment.end_time}`);
    });

    const description = Object.entries(groupedByDay)
      .map(([day, times]) => `${dayNamesAr[day]}: ${times.join(', ')}`)
      .join('\n');

    return description;
  }

  // Static methods

  /**
   * Create a 24/7 access timezone
   * @param {number} organizationId
   * @param {string} name
   * @returns {Promise<AccessTimeZone>}
   */
  static async create24x7(organizationId, name = '24/7 Access') {
    const segments = [];
    for (let day = 0; day <= 6; day++) {
      segments.push({
        day_of_week: day,
        start_time: '00:00',
        end_time: '23:59',
      });
    }

    return this.create({
      organization_id: organizationId,
      name,
      description: 'Full access 24 hours a day, 7 days a week',
      time_segments: segments,
    });
  }

  /**
   * Create business hours timezone (Sunday-Thursday, 8AM-5PM)
   * @param {number} organizationId
   * @param {string} name
   * @returns {Promise<AccessTimeZone>}
   */
  static async createBusinessHours(organizationId, name = 'Business Hours') {
    const segments = [];
    // Sunday to Thursday (0-4)
    for (let day = 0; day <= 4; day++) {
      segments.push({
        day_of_week: day,
        start_time: '08:00',
        end_time: '17:00',
      });
    }

    return this.create({
      organization_id: organizationId,
      name,
      description: 'Sunday to Thursday, 8:00 AM to 5:00 PM',
      time_segments: segments,
    });
  }
}

export default AccessTimeZone;
