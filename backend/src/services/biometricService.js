/**
 * Biometric Service
 * خدمة إدارة البيانات البيومترية (Face & Card)
 */

import { Employee, Device, User, FaceTemplate, CardTemplate, sequelize } from '../models/index.js';
import { AppError } from '../middlewares/errorHandler.js';
import { uploadFaceViaISAPI, deleteFaceViaISAPI } from './isapiFaceService.js';

/** C# SDK microservice URL (binary HCNetSDK protocol — bypasses ISAPI notSupport) */
const SDK_SERVICE_URL = process.env.SDK_SERVICE_URL || 'http://localhost:5000';

/** Use ISAPI instead of SDK when port 8000 is not available */
const shouldUseISAPI = (device) => {
  return device.sdk_port === 80 || device.sdk_port === 443 || process.env.USE_ISAPI === 'true';
};

/**
 * Upload a face image to the device using the C# SDK microservice.
 * يجب أن تنجح العملية على الجهاز، وإلا سترجع خطأ.
 */
async function uploadFaceViaSDKService(device, employee, imageBuffer) {
  try {
    // استخدام sdk_port من الجهاز إذا كان موجود، وإلا استخدم 8000
    const sdkPort = device.sdk_port || 8000;
    
    console.log(`[BiometricService] Attempting to upload face for employee ${employee.employee_no} to device ${device.ip_address}:${sdkPort}`);
    console.log(`[BiometricService] SDK Service URL: ${SDK_SERVICE_URL}`);
    
    // device.port is the HTTP/ISAPI port (80). SDK binary protocol typically uses 8000.
    const body = JSON.stringify({
      ip:             device.ip_address,
      port:           sdkPort,
      username:       device.username || 'admin',
      password:       device.password || '',
      employeeNo:     employee.employee_no,
      name:           employee.name,
      cardNo:         employee.employee_no,
      faceImageBase64: imageBuffer.toString('base64'),
      readerNo:       1
    });

    const res = await fetch(`${SDK_SERVICE_URL}/api/face/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal:  AbortSignal.timeout(30_000)
    });

    const data = await res.json();
    console.log(`[BiometricService] SDK Service Response:`, data);

    if (data.success) {
      console.log(`✅ [BiometricService] Face uploaded successfully for employee ${employee.employee_no}`);
      return { success: true, faceId: employee.employee_no, method: 'sdk-service' };
    } else {
      console.error(`❌ [BiometricService] SDK service rejected face: ${data.message} (code ${data.errorCode})`);
      return { success: false, error: data.message || 'فشل تسجيل الوجه على الجهاز' };
    }
  } catch (err) {
    console.error('❌ [BiometricService] SDK service error:', err.message);
    console.error('تأكد من أن C# Service شغال على:', SDK_SERVICE_URL);
    return { success: false, error: `فشل الاتصال بـ SDK Service: ${err.message}` };
  }
}

/**
 * Delete a face from device (best-effort).
 * NOTE: The C# service does not yet expose a delete endpoint; handled gracefully.
 */
async function deleteFaceViaSDKService(device, employee) {
  // Face delete via SDK is not yet implemented on C# side — no-op for now
  console.log(`[BiometricService] Face delete from device skipped (SDK service delete not yet implemented) for employee ${employee.employee_no}`);
}

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

    // 4. Upload face to device - choose method based on available port
    console.log(`[BiometricService] Starting face registration for employee #${employee.employee_no} on device ${device.name}`);
    
    let uploadResult;
    if (shouldUseISAPI(device)) {
      console.log(`[BiometricService] Using ISAPI (HTTP) on port ${device.port || 80}`);
      uploadResult = await uploadFaceViaISAPI(device, employee, imageBuffer);
    } else {
      console.log(`[BiometricService] Using SDK Binary Protocol on port ${device.sdk_port || 8000}`);
      uploadResult = await uploadFaceViaSDKService(device, employee, imageBuffer);
    }

    // 5. إذا فشل رفع الصورة للجهاز، نوقف العملية ونرجع خطأ
    if (!uploadResult.success) {
      const portInfo = shouldUseISAPI(device) 
        ? `${device.ip_address}:${device.port || 80} (HTTP/ISAPI)`
        : `${device.ip_address}:${device.sdk_port || 8000} (SDK Binary)`;
      
      throw new AppError(
        `فشل تسجيل الوجه على الجهاز: ${uploadResult.error}\n\n` +
        `تأكد من:\n` +
        `1. الجهاز متصل وشغال (${portInfo})\n` +
        `2. معلومات تسجيل الدخول للجهاز صحيحة\n` +
        `3. الجهاز يدعم ${shouldUseISAPI(device) ? 'ISAPI REST API' : 'SDK Binary Protocol'}`,
        500
      );
    }

    // 6. Save face template to database
    const [faceTemplate] = await FaceTemplate.upsert({
      employee_id: employee.id,
      device_id: device.id,
      face_id: uploadResult.faceId || employee.employee_no,
      sync_status: 'synced',
      sync_error: null,
      last_synced_at: new Date(),
      is_active: true
    }, { transaction });

    // 7. Update employee metadata
    await employee.update({
      metadata: {
        ...employee.metadata,
        has_face: true,
        face_registered_at: new Date(),
        face_registered_by: user.id
      }
    }, { transaction });

    await transaction.commit();

    console.log(`✅ [BiometricService] Face registration completed successfully for employee #${employee.employee_no}`);

    return {
      success: true,
      message: 'تم تسجيل الوجه على الجهاز بنجاح',
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
        registered_at: faceTemplate.created_at,
        sync_status: 'synced'
      }
    };

  } catch (error) {
    // Only rollback if transaction is still active
    if (!transaction.finished) {
      await transaction.rollback();
    }
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

    // 4. Delete from device (best-effort, not fatal if it fails)
    if (shouldUseISAPI(device)) {
      await deleteFaceViaISAPI(device, employee).catch(err => {
        console.warn('[BiometricService] ISAPI face deletion warning:', err.message);
      });
    } else {
      await deleteFaceViaSDKService(device, employee).catch(err => {
        console.warn('[BiometricService] SDK face deletion warning:', err.message);
      });
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
    // Only rollback if transaction is still active
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
    // Only rollback if transaction is still active
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
    // Only rollback if transaction is still active
    if (!transaction.finished) {
      await transaction.rollback();
    }
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
