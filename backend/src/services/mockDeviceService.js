/**
 * Mock Device Service للتطوير بدون جهاز حقيقي
 * يمكن استخدامه للاختبار قبل توفر الجهاز الفعلي
 */

class MockDeviceService {
  /**
   * Mock Face Registration
   */
  static async registerFace(deviceId, employeeId, imageData) {
    console.log('🎭 Mock: Registering face...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Employee ID: ${employeeId}`);
    console.log(`   Image Size: ${imageData?.length || 0} bytes`);

    // Simulate network delay
    await this.delay(500);

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        message: 'تم تسجيل الوجه بنجاح (Mock)',
        data: {
          faceId: `FACE_${Date.now()}`,
          employeeId,
          deviceId,
          registeredAt: new Date().toISOString()
        }
      };
    } else {
      throw new Error('فشل تسجيل الوجه - جودة الصورة منخفضة (Mock)');
    }
  }

  /**
   * Mock Card Registration
   */
  static async registerCard(deviceId, employeeId, cardNumber) {
    console.log('🎭 Mock: Registering card...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Employee ID: ${employeeId}`);
    console.log(`   Card Number: ${cardNumber}`);

    await this.delay(300);

    return {
      success: true,
      message: 'تم تسجيل الكارت بنجاح (Mock)',
      data: {
        cardId: `CARD_${Date.now()}`,
        cardNumber,
        employeeId,
        deviceId,
        registeredAt: new Date().toISOString()
      }
    };
  }

  /**
   * Mock Delete Face
   */
  static async deleteFace(deviceId, employeeId) {
    console.log('🎭 Mock: Deleting face...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Employee ID: ${employeeId}`);

    await this.delay(300);

    return {
      success: true,
      message: 'تم حذف الوجه بنجاح (Mock)',
      data: {
        employeeId,
        deviceId,
        deletedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Mock Delete Card
   */
  static async deleteCard(deviceId, cardNumber) {
    console.log('🎭 Mock: Deleting card...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Card Number: ${cardNumber}`);

    await this.delay(300);

    return {
      success: true,
      message: 'تم حذف الكارت بنجاح (Mock)',
      data: {
        cardNumber,
        deviceId,
        deletedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Mock Test Connection
   */
  static async testConnection(deviceId, ip, port) {
    console.log('🎭 Mock: Testing connection...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   IP: ${ip}:${port}`);

    await this.delay(800);

    // Simulate 80% success rate
    const success = Math.random() > 0.2;

    if (success) {
      return {
        success: true,
        message: 'الاتصال ناجح (Mock)',
        data: {
          online: true,
          deviceInfo: {
            model: 'DS-K1T671M (Mock)',
            serialNumber: 'MOCK12345678',
            firmware: 'V3.5.54 build 230101',
            capacity: {
              faces: 3000,
              cards: 5000,
              usedFaces: 150,
              usedCards: 80
            }
          },
          responseTime: Math.floor(Math.random() * 100) + 50
        }
      };
    } else {
      throw new Error('فشل الاتصال بالجهاز (Mock)');
    }
  }

  /**
   * Mock Pull Logs
   */
  static async pullLogs(deviceId, startTime, endTime) {
    console.log('🎭 Mock: Pulling access logs...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Period: ${startTime} to ${endTime}`);

    await this.delay(1200);

    // Generate mock logs
    const logs = this.generateMockLogs(10);

    return {
      success: true,
      message: `تم سحب ${logs.length} سجل بنجاح (Mock)`,
      data: {
        logs,
        total: logs.length,
        deviceId,
        pulledAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate Mock Access Logs
   */
  static generateMockLogs(count = 10) {
    const logs = [];
    const methods = ['face', 'card', 'fingerprint'];
    const types = ['check_in', 'check_out'];
    const names = ['أحمد محمد', 'فاطمة علي', 'محمد حسن', 'سارة خالد', 'علي أحمد'];

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      logs.push({
        id: `LOG_${Date.now()}_${i}`,
        employee_no: String(1000 + Math.floor(Math.random() * 100)).padStart(6, '0'),
        employee_name: names[Math.floor(Math.random() * names.length)],
        timestamp: timestamp.toISOString(),
        log_type: types[Math.floor(Math.random() * types.length)],
        verification_method: methods[Math.floor(Math.random() * methods.length)],
        temperature: (35.5 + Math.random() * 2).toFixed(1),
        mask_detection: Math.random() > 0.5,
        door_number: Math.floor(Math.random() * 2) + 1
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Helper: Simulate delay
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if we should use mock (based on env)
   */
  static shouldUseMock() {
    return process.env.USE_MOCK_DEVICE === 'true' || 
           process.env.NODE_ENV === 'development';
  }
}

export default MockDeviceService;
