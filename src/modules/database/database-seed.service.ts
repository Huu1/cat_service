import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { Category } from '../category/entities/category.entity';
import { AccountTemplate } from '../account-template/entities/account-template.entity';
import { RoleService } from '../user/services/role.service';
import { PermissionService } from '../user/services/permission.service';
import * as bcryptjs from 'bcryptjs';

// 导入数据文件
import { permissionsData, rolesData } from '../../data/permissions.data';
import { accountTemplates } from 'src/data/account-templates.data';
import { allCategories } from 'src/data/categories.data';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(AccountTemplate)
    private accountTemplateRepository: Repository<AccountTemplate>,
    private configService: ConfigService,
    private dataSource: DataSource,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('开始初始化数据库...');

    try {
      // 检查数据库连接
      await this.dataSource.query('SELECT 1');
      this.logger.log('数据库连接成功');

      // 检查数据库表是否存在，如果不存在则创建
      const tablesExist = await this.checkTablesExist();
      if (!tablesExist) {
        this.logger.log('数据库表不存在，尝试创建基础表结构...');
        try {
          // 使用 TypeORM 同步创建表结构
          await this.dataSource.synchronize();
          this.logger.log('成功创建数据库表结构');
        } catch (syncError) {
          this.logger.error(`创建表结构失败: ${syncError.message}`);
          return;
        }
      }

      // 检查是否有待执行的迁移
      try {
        const pendingMigrations = await this.dataSource.showMigrations();
        if (pendingMigrations) {
          this.logger.log('检测到待执行的迁移，开始执行...');
          await this.dataSource.runMigrations();
          this.logger.log('数据库迁移完成');
        }
      } catch (migrationError) {
        this.logger.error(`迁移执行失败: ${migrationError.message}`);
      }

      // 初始化系统数据
      await this.initSystemData();

      // 初始化系统用户和权限
      await this.initSystemUser();

      this.logger.log('数据库初始化完成');
    } catch (error) {
      this.logger.error(`数据库初始化失败: ${error.message}`);
    }
  }

  // 初始化系统数据
  async initSystemData() {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // 检查表是否存在
        const tablesExist = await this.checkTablesExist();
        if (!tablesExist) {
          this.logger.warn('数据库表不存在，跳过初始化系统数据');
          return {
            code: 200,
            message: '数据库表不存在，跳过初始化',
            data: {},
          };
        }

        // 初始化分类
        for (const categoryData of allCategories) {
          try {
            const existingCategory = await manager.findOne(Category, {
              where: { name: categoryData.name, type: categoryData.type },
            });

            if (existingCategory) {
              this.logger.log(`分类 ${categoryData.name} (${categoryData.type}) 已存在，更新信息`);
          
            } else {
              this.logger.log(`创建新分类 ${categoryData.name} (${categoryData.type})`);
              await manager.save(Category, categoryData);
            }
          } catch (error) {
            this.logger.warn(`处理分类 ${categoryData.name} 时出错: ${error.message}`);
            // 继续处理下一个分类，不中断流程
          }
        }

        // 初始化账户模板
        for (const templateData of accountTemplates) {
          try {
            const existingTemplate = await manager.findOne(AccountTemplate, {
              where: { name: templateData.name, type: templateData.type },
            });

            if (existingTemplate) {
              this.logger.log(`账户模板 ${templateData.name} (${templateData.type}) 已存在，更新信息`);
            } else {
              this.logger.log(`创建新账户模板 ${templateData.name} (${templateData.type})`);
              await manager.save(AccountTemplate, templateData);
            }
          } catch (error) {
            this.logger.warn(`处理账户模板 ${templateData.name} 时出错: ${error.message}`);
            // 继续处理下一个模板，不中断流程
          }
        }

        this.logger.log('系统基础数据初始化成功');
        return {
          code: 200,
          message: '系统初始化成功',
          data: {},
        };
      });
    } catch (error) {
      this.logger.error(`初始化系统数据失败: ${error.message}`);
      // 如果是表不存在的错误，返回特定消息
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return {
          code: 200,
          message: '数据库表不存在，跳过初始化',
          data: {},
        };
      }
      throw error;
    }
  }

  // 检查必要的表是否存在
  private async checkTablesExist(): Promise<boolean> {
    try {
      // 查询数据库中是否存在必要的表
      const tables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${this.configService.get('DB_DATABASE')}' 
        AND table_name IN ('categories', 'account_templates', 'users', 'roles')
      `);
      
      return tables.length >= 4; // 至少需要这4个表
    } catch (error) {
      this.logger.error(`检查表是否存在失败: ${error.message}`);
      return false;
    }
  }

  // 初始化系统用户和权限
  async initSystemUser() {
    try {
      // 创建基础权限
      const permissions = await Promise.all(
        permissionsData.map((permData) =>
          this.permissionService.create(permData),
        ),
      ).catch((error) => {
        // 如果权限已存在，忽略错误
        this.logger.log('部分权限已存在，跳过创建');
        return this.permissionService.findAll();
      });

      // 创建角色
      const createdRoles = [];
      for (const roleData of rolesData) {
        const { code, name, description, allPermissions, permissionCodes } =
          roleData;

        let permissionIds = [];
        if (allPermissions) {
          permissionIds = permissions.map((p) => p.id);
        } else if (permissionCodes) {
          permissionIds = permissions
            .filter((p) =>
              permissionCodes.some((code) => p.code.startsWith(code)),
            )
            .map((p) => p.id);
        }

        const role = await this.roleService
          .create({
            code,
            name,
            description,
            permissionIds,
          })
          .catch(async () => {
            this.logger.log(`${name}角色已存在，获取现有角色`);
            return this.roleRepository.findOne({ where: { code } });
          });

        createdRoles.push(role);
      }

      // 从配置中获取用户信息并创建用户
      await this.createSystemUsers(createdRoles);

      this.logger.log('系统用户和权限初始化完成');
      return {
        message: '系统初始化完成',
        data: {
          permissions: permissions.map((p) => p.code),
          roles: createdRoles.map((r) => r.code),
        },
      };
    } catch (error) {
      this.logger.error(`初始化系统用户和权限失败: ${error.message}`);
      return {
        message: '初始化系统用户和权限失败',
        data: {},
      };
    }
  } // 确保这里有闭合的花括号

  // 新增方法：创建系统用户
  private async createSystemUsers(roles: Role[]) {
    // 用户配置数据
    const usersConfig = [
      {
        username: this.configService.get('SUPER_ADMIN_USERNAME', 'superadmin'),
        password: this.configService.get('SUPER_ADMIN_PASSWORD', 'superadmin123'),
        roleCode: 'super_admin',
        description: '超级管理员'
      },
      {
        username: this.configService.get('ADMIN_USERNAME', 'admin'),
        password: this.configService.get('ADMIN_PASSWORD', 'admin123'),
        roleCode: 'admin',
        description: '管理员'
      },
      {
        username: this.configService.get('USER_USERNAME', 'user'),
        password: this.configService.get('USER_PASSWORD', 'user123'),
        roleCode: 'user',
        description: '普通用户'
      }
    ];

    // 创建用户
    const createdUsers = [];
    for (const userConfig of usersConfig) {
      const { username, password, roleCode, description } = userConfig;
      
      // 查找对应角色
      const role = roles.find(r => r.code === roleCode);
      if (!role) {
        this.logger.warn(`未找到角色 ${roleCode}，跳过创建用户 ${username}`);
        continue;
      }

      // 检查用户是否已存在
      const existingUser = await this.userRepository.findOne({
        where: { username },
        relations: ['roles']
      });

      if (existingUser) {
        this.logger.log(`用户 ${username} 已存在，跳过创建`);
        createdUsers.push(username);
        continue;
      }

      // 创建新用户
      try {
        const hashedPassword = await bcryptjs.hash(password, 10);
        await this.userRepository.save({
          username,
          password: hashedPassword,
          roles: [role],
          isActive: true
        });
        this.logger.log(`成功创建${description}用户: ${username}`);
        createdUsers.push(username);
      } catch (error) {
        this.logger.error(`创建用户 ${username} 失败: ${error.message}`);
      }
    }

    return createdUsers;
  }
}
