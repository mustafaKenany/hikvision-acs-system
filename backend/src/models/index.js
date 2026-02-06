import { Sequelize } from 'sequelize';
import dbConfig from '../config/database.js';

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Import models
import Organization from './Organization.js';
import User from './User.js';
import Device from './Device.js';
import Employee from './Employee.js';
import FaceTemplate from './FaceTemplate.js';
import CardTemplate from './CardTemplate.js';
import FingerprintTemplate from './FingerprintTemplate.js';
import AttendanceLog from './AttendanceLog.js';
import AttendanceSummary from './AttendanceSummary.js';
import WorkSchedule from './WorkSchedule.js';
import EmployeeSchedule from './EmployeeSchedule.js';
import Notification from './Notification.js';
import AuditLog from './AuditLog.js';
import SystemSetting from './SystemSetting.js';
import AccessTimeZone from './AccessTimeZone.js';
import Door from './Door.js';
import AccessPermission from './AccessPermission.js';

// Initialize all models
const models = {
  Organization: Organization.init(sequelize),
  User: User.init(sequelize),
  Device: Device.init(sequelize),
  Employee: Employee.init(sequelize),
  FaceTemplate: FaceTemplate.init(sequelize),
  CardTemplate: CardTemplate.init(sequelize),
  FingerprintTemplate: FingerprintTemplate.init(sequelize),
  AttendanceLog: AttendanceLog.init(sequelize),
  AttendanceSummary: AttendanceSummary.init(sequelize),
  WorkSchedule: WorkSchedule.init(sequelize),
  EmployeeSchedule: EmployeeSchedule.init(sequelize),
  Notification: Notification.init(sequelize),
  AuditLog: AuditLog.init(sequelize),
  SystemSetting: SystemSetting.init(sequelize),
  AccessTimeZone: AccessTimeZone.init(sequelize),
  Door: Door.init(sequelize),
  AccessPermission: AccessPermission.init(sequelize),
};

// Setup associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export sequelize and models
export { sequelize };

// Export individual models
export {
  Organization,
  User,
  Device,
  Employee,
  FaceTemplate,
  CardTemplate,
  FingerprintTemplate,
  AttendanceLog,
  AttendanceSummary,
  WorkSchedule,
  EmployeeSchedule,
  Notification,
  AuditLog,
  SystemSetting,
  AccessTimeZone,
  Door,
  AccessPermission
};

export default models;
