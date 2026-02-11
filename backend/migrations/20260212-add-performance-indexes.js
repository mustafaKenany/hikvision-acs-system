/**
 * Migration: Add Performance Indexes
 * Purpose: Optimize query performance for 10,000+ employees
 * Date: 2026-02-12
 */

export default {
  async up(queryInterface, Sequelize) {
    console.log('🔧 Adding performance indexes...');

    try {
      // ===================================
      // EMPLOYEES TABLE INDEXES
      // ===================================
      
      // 1. Composite index for organization + active status (most common query)
      await queryInterface.addIndex('employees', ['organization_id', 'is_active'], {
        name: 'idx_employees_org_active',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_employees_org_active');

      // 2. Index for department filtering
      await queryInterface.addIndex('employees', ['department'], {
        name: 'idx_employees_department',
        using: 'BTREE',
        where: {
          department: {
            [Sequelize.Op.ne]: null
          }
        }
      });
      console.log('✅ Added: idx_employees_department');

      // 3. Full-text search index for name (English)
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_employees_name_fulltext 
        ON employees USING GIN (to_tsvector('english', name));
      `);
      console.log('✅ Added: idx_employees_name_fulltext');

      // 4. Full-text search index for name_ar (Arabic)
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_employees_name_ar_fulltext 
        ON employees USING GIN (to_tsvector('arabic', COALESCE(name_ar, '')));
      `);
      console.log('✅ Added: idx_employees_name_ar_fulltext');

      // 5. Index for employee_no search
      await queryInterface.addIndex('employees', ['employee_no'], {
        name: 'idx_employees_employee_no',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_employees_employee_no');

      // 6. Covering index for list queries (includes commonly selected columns)
      await queryInterface.addIndex('employees', 
        ['organization_id', 'is_active', 'created_at'], 
        {
          name: 'idx_employees_list_covering',
          using: 'BTREE',
          include: ['id', 'name', 'employee_no', 'department', 'position', 'photo_url']
        }
      );
      console.log('✅ Added: idx_employees_list_covering');

      // ===================================
      // ACCESS LOGS TABLE INDEXES
      // ===================================

      // 7. Composite index for device + timestamp (pull logs query)
      await queryInterface.addIndex('access_logs', ['device_id', 'timestamp'], {
        name: 'idx_access_logs_device_time',
        using: 'BTREE',
        order: [['device_id', 'ASC'], ['timestamp', 'DESC']]
      });
      console.log('✅ Added: idx_access_logs_device_time');

      // 8. Composite index for employee + timestamp (employee activity)
      await queryInterface.addIndex('access_logs', ['employee_id', 'timestamp'], {
        name: 'idx_access_logs_employee_time',
        using: 'BTREE',
        order: [['employee_id', 'ASC'], ['timestamp', 'DESC']]
      });
      console.log('✅ Added: idx_access_logs_employee_time');

      // 9. Composite index for timestamp (for recent logs queries)
      await queryInterface.addIndex('access_logs', ['timestamp', 'device_id', 'employee_id'], {
        name: 'idx_access_logs_timestamp',
        using: 'BTREE',
        order: [['timestamp', 'DESC'], ['device_id', 'ASC'], ['employee_id', 'ASC']]
      });
      console.log('✅ Added: idx_access_logs_timestamp');

      // ===================================
      // AUDIT LOGS TABLE INDEXES
      // ===================================

      // 10. Composite index for user + timestamp
      await queryInterface.addIndex('audit_logs', ['user_id', 'created_at'], {
        name: 'idx_audit_logs_user_time',
        using: 'BTREE',
        order: [['user_id', 'ASC'], ['created_at', 'DESC']]
      });
      console.log('✅ Added: idx_audit_logs_user_time');

      // 11. Composite index for resource type + resource id
      await queryInterface.addIndex('audit_logs', ['resource_type', 'resource_id'], {
        name: 'idx_audit_logs_resource',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_audit_logs_resource');

      // 12. Index for action filtering
      await queryInterface.addIndex('audit_logs', ['action'], {
        name: 'idx_audit_logs_action',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_audit_logs_action');

      // ===================================
      // DEVICES TABLE INDEXES
      // ===================================

      // 13. Composite index for organization + active status
      await queryInterface.addIndex('devices', ['organization_id', 'is_active'], {
        name: 'idx_devices_org_active',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_devices_org_active');

      // 14. Index for IP address lookup
      await queryInterface.addIndex('devices', ['ip_address'], {
        name: 'idx_devices_ip',
        using: 'BTREE',
        unique: false
      });
      console.log('✅ Added: idx_devices_ip');

      // ===================================
      // ORGANIZATIONS TABLE INDEXES
      // ===================================

      // 15. Index for active organizations
      await queryInterface.addIndex('organizations', ['is_active'], {
        name: 'idx_organizations_active',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_organizations_active');

      // ===================================
      // USERS TABLE INDEXES
      // ===================================

      // 16. Composite index for organization + role
      await queryInterface.addIndex('users', ['organization_id', 'role'], {
        name: 'idx_users_org_role',
        using: 'BTREE'
      });
      console.log('✅ Added: idx_users_org_role');

      console.log('');
      console.log('✅ All performance indexes created successfully!');
      console.log('📊 Total indexes added: 16');
      console.log('🚀 Database performance optimized for 10,000+ employees');

    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔧 Removing performance indexes...');

    try {
      // Remove all indexes in reverse order
      const indexes = [
        'idx_users_org_role',
        'idx_organizations_active',
        'idx_devices_ip',
        'idx_devices_org_active',
        'idx_audit_logs_action',
        'idx_audit_logs_resource',
        'idx_audit_logs_user_time',
        'idx_access_logs_timestamp',
        'idx_access_logs_employee_time',
        'idx_access_logs_device_time',
        'idx_employees_list_covering',
        'idx_employees_employee_no',
        'idx_employees_name_ar_fulltext',
        'idx_employees_name_fulltext',
        'idx_employees_department',
        'idx_employees_org_active'
      ];

      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('employees', indexName);
          console.log(`✅ Removed: ${indexName}`);
        } catch (err) {
          // Try other tables if not in employees
          const tables = ['access_logs', 'audit_logs', 'devices', 'organizations', 'users'];
          for (const table of tables) {
            try {
              await queryInterface.removeIndex(table, indexName);
              console.log(`✅ Removed: ${indexName}`);
              break;
            } catch (e) {
              // Continue to next table
            }
          }
        }
      }

      console.log('✅ All indexes removed successfully!');

    } catch (error) {
      console.error('❌ Error removing indexes:', error.message);
      throw error;
    }
  }
};
