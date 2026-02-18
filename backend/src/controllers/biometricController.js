/**
 * Biometric Controller
 * معالج البيانات البيومترية (Face & Card Registration)
 */

import * as biometricService from '../services/biometricService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { success } from '../utils/response.js';

/**
 * Register Face
 */
const registerFace = async (req, res, next) => {
  try {
    const { employee_id, device_id } = req.body;
    const faceImage = req.file;

    if (!employee_id) {
      throw new AppError('معرّف الموظف مطلوب', 400);
    }

    if (!device_id) {
      throw new AppError('معرّف الجهاز مطلوب', 400);
    }

    if (!faceImage) {
      throw new AppError('صورة الوجه مطلوبة', 400);
    }

    const result = await biometricService.registerFace(
      req.user.id,
      employee_id,
      device_id,
      faceImage.buffer
    );

    return success(res, result, 'تم تسجيل الوجه بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Face
 */
const deleteFace = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { device_id } = req.body;

    if (!device_id) {
      throw new AppError('معرّف الجهاز مطلوب', 400);
    }

    const result = await biometricService.deleteFace(
      req.user.id,
      employeeId,
      device_id
    );

    return success(res, result, 'تم حذف الوجه بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Face Status
 */
const getFaceStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const result = await biometricService.getFaceStatus(
      req.user.id,
      employeeId
    );

    return success(res, result, 'تم جلب حالة الوجه بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Register Card
 */
const registerCard = async (req, res, next) => {
  try {
    const { employee_id, device_id, card_number, card_type } = req.body;

    if (!employee_id) {
      throw new AppError('معرّف الموظف مطلوب', 400);
    }

    if (!device_id) {
      throw new AppError('معرّف الجهاز مطلوب', 400);
    }

    if (!card_number) {
      throw new AppError('رقم الكارت مطلوب', 400);
    }

    const result = await biometricService.registerCard(
      req.user.id,
      employee_id,
      device_id,
      card_number,
      card_type || 'rfid'
    );

    return success(res, result, 'تم تسجيل الكارت بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Card
 */
const deleteCard = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { device_id } = req.body;

    if (!device_id) {
      throw new AppError('معرّف الجهاز مطلوب', 400);
    }

    const result = await biometricService.deleteCard(
      req.user.id,
      employeeId,
      device_id
    );

    return success(res, result, 'تم حذف الكارت بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Card Status
 */
const getCardStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const result = await biometricService.getCardStatus(
      req.user.id,
      employeeId
    );

    return success(res, result, 'تم جلب حالة الكارت بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Sync Employee Biometrics to all devices
 */
const syncEmployeeBiometrics = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const result = await biometricService.syncEmployeeBiometrics(
      req.user.id,
      employeeId
    );

    return success(res, result, 'تم مزامنة البيانات البيومترية بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Complete Biometric Status
 */
const getBiometricStatus = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const result = await biometricService.getBiometricStatus(
      req.user.id,
      employeeId
    );

    return success(res, result, 'تم جلب الحالة البيومترية بنجاح');
  } catch (error) {
    next(error);
  }
};

export default {
  registerFace,
  deleteFace,
  getFaceStatus,
  registerCard,
  deleteCard,
  getCardStatus,
  syncEmployeeBiometrics,
  getBiometricStatus
};
