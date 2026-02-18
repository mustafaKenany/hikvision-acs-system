/**
 * Biometric Service
 * خدمة إدارة البيانات البيومترية (Face & Card)
 */

import { Employee, Device, User, FaceTemplate, CardTemplate } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import MockDeviceService from './mockDeviceService.js';
import sequelize from '../config/database.js';

/**
 * Check if we should use Mock or Real Device Service
 */
const shouldUseMock = () => {
  return process.env.USE_MOCK_DEVICE === 'true' || process.env.NODE_ENV === 'development';
};

/**
 * Register Face
 */
export async function registerFace(userId, employeeId, deviceId, imageBuffer) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Verify user permissions
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    // 2. Verify employee exists and belongs to same organization
    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organization_id: user.organization_id
      }
    });

    if (!employee) {
      throw new AppError('الموظف غير موجود', 404);
    }

    // 3. Verify device exists and belongs to same organization
    const device = await Device.findOne({
      where: {
        id: deviceId,
        organization_id: user.organization_id,
        is_active: true
      }
    });

    if (!device) {
      throw new AppError('الجهاز غير موجود أو غير مفعّل', 404);
    }

    // 4. Register face (Mock or Real)
    let result;
    if (shouldUseMock()) {
      console.log('🎭 Using Mock Device Service for Face Registration');
      result = await MockDeviceService.registerFace(
        device.id,
        employee.id,
        imageBuffer
      );
    } else {
      // TODO: Real SDK Integration
      throw new AppError('Real SDK Integration not implemented yet', 501);
    }

    // 5. Save face template to database
    const faceTemplate = await FaceTemplate.create({
      employee_id: employee.id,
      device_id: device.id,
      face_data: imageBuffer.toString('base64'),
      sync_status: 'synced',
      synced_at: new Date()
    }, { transaction });

    // 6. Update employee metadata
    await employee.update({
      metadata: {
        ...employee.metadata,
        has_face: true,
        face_registered_at: new Date(),
        face_registered_by: user.id
      }
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        employee_no: employee.employee_no
      },
      device: {
        id: device.id,
        name: device.name,
        ip_address: device.ip_address
      },
      face_template: {
        id: faceTemplate.id,
        registered_at: faceTemplate.created_at
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Delete Face
 */
export async function deleteFace(userId, employeeId, deviceId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Verify user permissions
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    // 2. Verify employee
    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organization_id: user.organization_id
      }
    });

    if (!employee) {
      throw new AppError('الموظف غير موجود', 404);
    }

    // 3. Verify device
    const device = await Device.findOne({
      where: {
        id: deviceId,
        organization_id: user.organization_id
      }
    });

    if (!device) {
      throw new AppError('الجهاز غير موجود', 404);
    }

    // 4. Delete from device (Mock or Real)
    if (shouldUseMock()) {
      console.log('🎭 Using Mock Device Service for Face Deletion');
      await MockDeviceService.deleteFace(device.id, employee.id);
    } else {
      // TODO: Real SDK Integration
      throw new AppError('Real SDK Integration not implemented yet', 501);
    }

    // 5. Delete from database
    await FaceTemplate.destroy({
      where: {
        employee_id: employee.id,
        device_id: device.id
      },
      transaction
    });

    // 6. Update employee metadata
    await employee.update({
      metadata: {
        ...employee.metadata,
        has_face: false,
        face_deleted_at: new Date(),
        face_deleted_by: user.id
      }
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name
      },
      device: {
        id: device.id,
        name: device.name
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Get Face Status
 */
export async function getFaceStatus(userId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      organization_id: user.organization_id
    },
    include: [{
      model: FaceTemplate,
      as: 'faces',
      include: [{
        model: Device,
        as: 'device',
        attributes: ['id', 'name', 'ip_address', 'device_type']
      }]
    }]
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  return {
    employee_id: employee.id,
    employee_name: employee.name,
    has_face: employee.faces && employee.faces.length > 0,
    face_count: employee.faces ? employee.faces.length : 0,
    faces: employee.faces || []
  };
}

/**
 * Register Card
 */
export async function registerCard(userId, employeeId, deviceId, cardNumber, cardType) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Verify user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    // 2. Verify employee
    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organization_id: user.organization_id
      }
    });

    if (!employee) {
      throw new AppError('الموظف غير موجود', 404);
    }

    // 3. Verify device
    const device = await Device.findOne({
      where: {
        id: deviceId,
        organization_id: user.organization_id,
        is_active: true
      }
    });

    if (!device) {
      throw new AppError('الجهاز غير موجود أو غير مفعّل', 404);
    }

    // 4. Check if card number already exists
    const existingCard = await CardTemplate.findOne({
      where: { card_number: cardNumber }
    });

    if (existingCard) {
      throw new AppError('رقم الكارت موجود مسبقاً', 409);
    }

    // 5. Register card (Mock or Real)
    if (shouldUseMock()) {
      console.log('🎭 Using Mock Device Service for Card Registration');
      await MockDeviceService.registerCard(device.id, employee.id, cardNumber);
    } else {
      // TODO: Real SDK Integration
      throw new AppError('Real SDK Integration not implemented yet', 501);
    }

    // 6. Save card template to database
    const cardTemplate = await CardTemplate.create({
      employee_id: employee.id,
      device_id: device.id,
      card_number: cardNumber,
      card_type: cardType,
      is_active: true,
      sync_status: 'synced',
      synced_at: new Date()
    }, { transaction });

    // 7. Update employee metadata
    await employee.update({
      metadata: {
        ...employee.metadata,
        has_card: true,
        card_number: cardNumber,
        card_registered_at: new Date(),
        card_registered_by: user.id
      }
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        employee_no: employee.employee_no
      },
      device: {
        id: device.id,
        name: device.name
      },
      card: {
        id: cardTemplate.id,
        card_number: cardTemplate.card_number,
        card_type: cardTemplate.card_type,
        registered_at: cardTemplate.created_at
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Delete Card
 */
export async function deleteCard(userId, employeeId, deviceId) {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('المستخدم غير موجود', 404);
    }

    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organization_id: user.organization_id
      }
    });

    if (!employee) {
      throw new AppError('الموظف غير موجود', 404);
    }

    const device = await Device.findOne({
      where: {
        id: deviceId,
        organization_id: user.organization_id
      }
    });

    if (!device) {
      throw new AppError('الجهاز غير موجود', 404);
    }

    const cardTemplate = await CardTemplate.findOne({
      where: {
        employee_id: employee.id,
        device_id: device.id
      }
    });

    if (!cardTemplate) {
      throw new AppError('الكارت غير موجود', 404);
    }

    // Delete from device (Mock or Real)
    if (shouldUseMock()) {
      console.log('🎭 Using Mock Device Service for Card Deletion');
      await MockDeviceService.deleteCard(device.id, cardTemplate.card_number);
    } else {
      // TODO: Real SDK Integration
      throw new AppError('Real SDK Integration not implemented yet', 501);
    }

    // Delete from database
    await CardTemplate.destroy({
      where: {
        employee_id: employee.id,
        device_id: device.id
      },
      transaction
    });

    // Update employee metadata
    await employee.update({
      metadata: {
        ...employee.metadata,
        has_card: false,
        card_number: null,
        card_deleted_at: new Date(),
        card_deleted_by: user.id
      }
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name
      },
      device: {
        id: device.id,
        name: device.name
      }
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Get Card Status
 */
export async function getCardStatus(userId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      organization_id: user.organization_id
    },
    include: [{
      model: CardTemplate,
      as: 'cards',
      include: [{
        model: Device,
        as: 'device',
        attributes: ['id', 'name', 'ip_address', 'device_type']
      }]
    }]
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  return {
    employee_id: employee.id,
    employee_name: employee.name,
    has_card: employee.cards && employee.cards.length > 0,
    card_count: employee.cards ? employee.cards.length : 0,
    cards: employee.cards || []
  };
}

/**
 * Sync Employee Biometrics to all devices
 */
export async function syncEmployeeBiometrics(userId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      organization_id: user.organization_id
    },
    include: [
      { model: FaceTemplate, as: 'faces' },
      { model: CardTemplate, as: 'cards' }
    ]
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  const devices = await Device.findAll({
    where: {
      organization_id: user.organization_id,
      is_active: true
    }
  });

  const results = {
    success: true,
    employee_id: employee.id,
    synced_devices: 0,
    failed_devices: 0,
    details: []
  };

  for (const device of devices) {
    try {
      // Sync face if exists
      if (employee.faces && employee.faces.length > 0) {
        if (shouldUseMock()) {
          await MockDeviceService.registerFace(device.id, employee.id, Buffer.from(''));
        }
      }

      // Sync card if exists
      if (employee.cards && employee.cards.length > 0) {
        if (shouldUseMock()) {
          await MockDeviceService.registerCard(device.id, employee.id, employee.cards[0].card_number);
        }
      }

      results.synced_devices++;
      results.details.push({
        device_id: device.id,
        device_name: device.name,
        status: 'success'
      });

    } catch (error) {
      results.failed_devices++;
      results.details.push({
        device_id: device.id,
        device_name: device.name,
        status: 'failed',
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Get Complete Biometric Status
 */
export async function getBiometricStatus(userId, employeeId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('المستخدم غير موجود', 404);
  }

  const employee = await Employee.findOne({
    where: {
      id: employeeId,
      organization_id: user.organization_id
    },
    include: [
      {
        model: FaceTemplate,
        as: 'faces',
        include: [{ model: Device, as: 'device', attributes: ['id', 'name', 'ip_address'] }]
      },
      {
        model: CardTemplate,
        as: 'cards',
        include: [{ model: Device, as: 'device', attributes: ['id', 'name', 'ip_address'] }]
      }
    ]
  });

  if (!employee) {
    throw new AppError('الموظف غير موجود', 404);
  }

  return {
    employee: {
      id: employee.id,
      name: employee.name,
      employee_no: employee.employee_no,
      photo_url: employee.photo_url
    },
    biometrics: {
      face: {
        registered: employee.faces && employee.faces.length > 0,
        count: employee.faces ? employee.faces.length : 0,
        devices: employee.faces || []
      },
      card: {
        registered: employee.cards && employee.cards.length > 0,
        count: employee.cards ? employee.cards.length : 0,
        devices: employee.cards || []
      }
    },
    metadata: employee.metadata || {}
  };
}
