/**
 * Image Processing Middleware using Sharp
 * Handles image optimization, resizing, and format conversion
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { AppError } from './errorHandler.js';

/**
 * Process employee photo
 * - Resize to 400x400 (square for face recognition)
 * - Convert to JPEG
 * - Optimize quality to 85%
 */
export const processEmployeePhoto = async (file) => {
  if (!file) {
    throw new AppError('لا يوجد ملف للمعالجة', 400);
  }

  try {
    const outputFilename = `processed-${Date.now()}-${path.basename(file.filename, path.extname(file.filename))}.jpg`;
    const outputPath = path.join(path.dirname(file.path), outputFilename);

    await sharp(file.path)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: false
      })
      .jpeg({ 
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputPath);

    // Get file stats for metadata
    const stats = fs.statSync(outputPath);
    const metadata = await sharp(outputPath).metadata();

    // Delete original file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      filename: outputFilename,
      path: outputPath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: 'jpeg'
    };
  } catch (error) {
    console.error('Error processing employee photo:', error);
    throw new AppError('فشل في معالجة الصورة', 500);
  }
};

/**
 * Process organization logo
 * - Resize to 300x300 (maintain aspect ratio)
 * - Convert to PNG with transparency support
 * - Optimize quality
 */
export const processOrganizationLogo = async (file) => {
  if (!file) {
    throw new AppError('لا يوجد ملف للمعالجة', 400);
  }

  try {
    const outputFilename = `logo-${Date.now()}-${path.basename(file.filename, path.extname(file.filename))}.png`;
    const outputPath = path.join(path.dirname(file.path), outputFilename);

    await sharp(file.path)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        progressive: true
      })
      .toFile(outputPath);

    // Get file stats
    const stats = fs.statSync(outputPath);
    const metadata = await sharp(outputPath).metadata();

    // Delete original file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      filename: outputFilename,
      path: outputPath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: 'png'
    };
  } catch (error) {
    console.error('Error processing organization logo:', error);
    throw new AppError('فشل في معالجة الشعار', 500);
  }
};

/**
 * Process generic image
 * - Resize based on provided dimensions
 * - Optimize quality
 * - Support multiple formats
 */
export const processImage = async (file, options = {}) => {
  if (!file) {
    throw new AppError('لا يوجد ملف للمعالجة', 400);
  }

  const {
    width = 800,
    height = 800,
    fit = 'inside',
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    const ext = format === 'jpeg' ? 'jpg' : format;
    const outputFilename = `processed-${Date.now()}-${path.basename(file.filename, path.extname(file.filename))}.${ext}`;
    const outputPath = path.join(path.dirname(file.path), outputFilename);

    let sharpInstance = sharp(file.path)
      .resize(width, height, {
        fit,
        withoutEnlargement: false
      });

    // Apply format-specific options
    if (format === 'jpeg' || format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    }

    await sharpInstance.toFile(outputPath);

    // Get file stats
    const stats = fs.statSync(outputPath);
    const metadata = await sharp(outputPath).metadata();

    // Delete original file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      filename: outputFilename,
      path: outputPath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new AppError('فشل في معالجة الصورة', 500);
  }
};

/**
 * Generate thumbnail
 * Creates a small thumbnail version of an image
 */
export const generateThumbnail = async (file, size = 150) => {
  if (!file) {
    throw new AppError('لا يوجد ملف للمعالجة', 400);
  }

  try {
    const outputFilename = `thumb-${Date.now()}-${path.basename(file.filename, path.extname(file.filename))}.jpg`;
    const outputPath = path.join(path.dirname(file.path), outputFilename);

    await sharp(file.path)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);

    return {
      filename: outputFilename,
      path: outputPath,
      size: stats.size
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new AppError('فشل في إنشاء الصورة المصغرة', 500);
  }
};

/**
 * Convert image to base64
 * Useful for inline images in emails or API responses
 */
export const imageToBase64 = async (filePath) => {
  try {
    const buffer = await sharp(filePath)
      .resize(400, 400, { fit: 'inside' })
      .toBuffer();
    
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new AppError('فشل في تحويل الصورة', 500);
  }
};

/**
 * Get image metadata
 */
export const getImageMetadata = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const stats = fs.statSync(filePath);

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      space: metadata.space,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error reading image metadata:', error);
    throw new AppError('فشل في قراءة معلومات الصورة', 500);
  }
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = async (filePath, minWidth = 200, minHeight = 200) => {
  try {
    const metadata = await sharp(filePath).metadata();

    if (metadata.width < minWidth || metadata.height < minHeight) {
      return {
        valid: false,
        message: `الصورة صغيرة جداً. الحد الأدنى: ${minWidth}x${minHeight}px`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      message: 'فشل في التحقق من أبعاد الصورة'
    };
  }
};

/**
 * Middleware: Process employee photo after upload
 */
export const processEmployeePhotoMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const processedImage = await processEmployeePhoto(req.file);
    req.processedFile = processedImage;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Process organization logo after upload
 */
export const processOrganizationLogoMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const processedImage = await processOrganizationLogo(req.file);
    req.processedFile = processedImage;
    next();
  } catch (error) {
    next(error);
  }
};

export default {
  processEmployeePhoto,
  processOrganizationLogo,
  processImage,
  generateThumbnail,
  imageToBase64,
  getImageMetadata,
  validateImageDimensions,
  processEmployeePhotoMiddleware,
  processOrganizationLogoMiddleware
};
