import { Sequelize } from 'sequelize';
import config from '../config/database.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

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
};

// Setup associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
