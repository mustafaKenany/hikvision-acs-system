/**
 * Migration: Add Performance Indexes to Organizations Table
 * التاريخ: 2026-02-15
 * 
 * الهدف: تحسين أداء الاستعلامات على جدول organizations
 */

export async function up(queryInterface, Sequelize) {
  console.log('📊 Adding performance indexes to organizations table...');

  try {
    // 1. Index على email (للبحث والتحقق من الفريدية)
    await queryInterface.addIndex('organizations', ['email'], {
      name: 'idx_organizations_email',
      unique: true
    });
    console.log('✅ Added unique index on email');

    // 2. Index على subscription_plan (للفلترة حسب الخطة)
    await queryInterface.addIndex('organizations', ['subscription_plan'], {
      name: 'idx_organizations_subscription_plan'
    });
    console.log('✅ Added index on subscription_plan');

    // 3. Index على is_active (للفلترة حسب الحالة)
    await queryInterface.addIndex('organizations', ['is_active'], {
      name: 'idx_organizations_is_active'
    });
    console.log('✅ Added index on is_active');

    // 4. Composite index على (is_active, subscription_plan) للاستعلامات المركبة
    await queryInterface.addIndex('organizations', ['is_active', 'subscription_plan'], {
      name: 'idx_organizations_active_plan'
    });
    console.log('✅ Added composite index on is_active + subscription_plan');

    // 5. Index على subscription_end (للتحقق من انتهاء الاشتراكات)
    await queryInterface.addIndex('organizations', ['subscription_end'], {
      name: 'idx_organizations_subscription_end',
      where: {
        subscription_end: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    console.log('✅ Added partial index on subscription_end');

    // 6. Index على name (للبحث والترتيب)
    await queryInterface.addIndex('organizations', ['name'], {
      name: 'idx_organizations_name'
    });
    console.log('✅ Added index on name');

    // 7. Index على created_at (للترتيب الزمني)
    await queryInterface.addIndex('organizations', ['created_at'], {
      name: 'idx_organizations_created_at'
    });
    console.log('✅ Added index on created_at');

    // 8. Index على phone (للبحث)
    await queryInterface.addIndex('organizations', ['phone'], {
      name: 'idx_organizations_phone',
      where: {
        phone: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    console.log('✅ Added partial index on phone');

    console.log('🎉 Successfully added 8 performance indexes to organizations table');
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  console.log('🔄 Removing indexes from organizations table...');

  try {
    await queryInterface.removeIndex('organizations', 'idx_organizations_email');
    await queryInterface.removeIndex('organizations', 'idx_organizations_subscription_plan');
    await queryInterface.removeIndex('organizations', 'idx_organizations_is_active');
    await queryInterface.removeIndex('organizations', 'idx_organizations_active_plan');
    await queryInterface.removeIndex('organizations', 'idx_organizations_subscription_end');
    await queryInterface.removeIndex('organizations', 'idx_organizations_name');
    await queryInterface.removeIndex('organizations', 'idx_organizations_created_at');
    await queryInterface.removeIndex('organizations', 'idx_organizations_phone');

    console.log('✅ All indexes removed successfully');
  } catch (error) {
    console.error('❌ Error removing indexes:', error.message);
    throw error;
  }
}
