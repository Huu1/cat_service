import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { Category } from '../category/entities/category.entity';
import { CategoryType } from '../category/entities/category.entity';
import * as bcrypt from 'bcrypt';
import { AccountType } from '../account/entities/account.entity';
import { AccountTemplate } from '../account-template/entities/account-template.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private configService: ConfigService,
    private dataSource: DataSource,
    @InjectRepository(AccountTemplate)
    private accountTemplateRepository: Repository<AccountTemplate>,
  ) {}

  async initSystem() {
    return await this.dataSource.transaction(async (manager) => {
      // 初始化角色
      const roles = [
        { name: 'admin', description: '系统管理员' },
        { name: 'user', description: '普通用户' },
      ];

      const savedRoles = [];
      for (const roleData of roles) {
        const existingRole = await manager.findOne(Role, {
          where: { name: roleData.name },
        });

        if (existingRole) {
          await manager.update(Role, { id: existingRole.id }, roleData);
          savedRoles.push(existingRole);
        } else {
          const newRole = await manager.save(Role, roleData);
          savedRoles.push(newRole);
        }
      }

      // 初始化管理员用户
      const adminRole = savedRoles.find((role) => role.name === 'admin');
      const adminUsername = this.configService.get('ADMIN_USERNAME', 'admin');
      const existingAdmin = await manager.findOne(User, {
        where: { username: adminUsername },
      });

      if (!existingAdmin && adminRole) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(
          this.configService.get('ADMIN_PASSWORD', 'admin123'),
          salt,
        );

        await manager.save(User, {
          username: adminUsername,
          password: hashedPassword,
          isActive: true,
          roles: [adminRole],
        });
      }

      // 初始化支出分类
      const expenseCategories = [
        { name: '餐饮', type: CategoryType.EXPENSE, icon: 'food', sort: 1 },
        { name: '交通', type: CategoryType.EXPENSE, icon: 'car', sort: 2 },
        { name: '购物', type: CategoryType.EXPENSE, icon: 'shopping', sort: 3 },
        { name: '居住', type: CategoryType.EXPENSE, icon: 'home', sort: 4 },
        {
          name: '娱乐',
          type: CategoryType.EXPENSE,
          icon: 'entertainment',
          sort: 5,
        },
        { name: '医疗', type: CategoryType.EXPENSE, icon: 'medical', sort: 6 },
        {
          name: '教育',
          type: CategoryType.EXPENSE,
          icon: 'education',
          sort: 7,
        },
      ];

      // 初始化收入分类
      const incomeCategories = [
        { name: '工资', type: CategoryType.INCOME, icon: 'salary', sort: 1 },
        { name: '奖金', type: CategoryType.INCOME, icon: 'bonus', sort: 2 },
        {
          name: '理财',
          type: CategoryType.INCOME,
          icon: 'investment',
          sort: 3,
        },
        { name: '兼职', type: CategoryType.INCOME, icon: 'part-time', sort: 4 },
        {
          name: '红包',
          type: CategoryType.INCOME,
          icon: 'red-packet',
          sort: 5,
        },
      ];

      const allCategories = [...expenseCategories, ...incomeCategories];

      for (const categoryData of allCategories) {
        const existingCategory = await manager.findOne(Category, {
          where: { name: categoryData.name, type: categoryData.type },
        });

        if (existingCategory) {
          await manager.update(
            Category,
            { id: existingCategory.id },
            categoryData,
          );
        } else {
          await manager.save(Category, categoryData);
        }
      }

      // 初始化账户模板
      const accountTemplates = [
        // 现金账户
        {
          name: '现金',
          type: AccountType.CASH,
          icon: 'cash',
          description: '日常现金账户',
          sort: 1,
        },
        {
          name: '储蓄卡',
          type: AccountType.CASH,
          icon: 'debit-card',
          description: '银行储蓄卡',
          sort: 2,
        },
        {
          name: '支付宝',
          type: AccountType.CASH,
          icon: 'alipay',
          description: '支付宝账户',
          sort: 3,
        },
        {
          name: '微信',
          type: AccountType.CASH,
          icon: 'wechat',
          description: '微信钱包',
          sort: 4,
        },

        // 信用账户
        {
          name: '信用卡',
          type: AccountType.CREDIT,
          icon: 'credit-card',
          description: '银行信用卡',
          sort: 1,
        },
        {
          name: '花呗',
          type: AccountType.CREDIT,
          icon: 'huabei',
          description: '支付宝花呗',
          sort: 2,
        },
        {
          name: '白条',
          type: AccountType.CREDIT,
          icon: 'baitiao',
          description: '京东白条',
          sort: 3,
        },

        // 投资账户
        {
          name: '基金账户',
          type: AccountType.INVESTMENT,
          icon: 'fund',
          description: '基金投资',
          sort: 1,
        },
        {
          name: '股票账户',
          type: AccountType.INVESTMENT,
          icon: 'stock',
          description: '股票投资',
          sort: 2,
        },
        {
          name: '余额理财',
          type: AccountType.INVESTMENT,
          icon: 'money-manage',
          description: '余额理财产品',
          sort: 3,
        },

        // 债权债务
        {
          name: '应收账款',
          type: AccountType.RECEIVABLE,
          icon: 'receivable',
          description: '别人欠我的钱',
          sort: 1,
        },
        {
          name: '应付账款',
          type: AccountType.PAYABLE,
          icon: 'payable',
          description: '我欠别人的钱',
          sort: 1,
        },
      ];

      for (const templateData of accountTemplates) {
        const existingTemplate = await manager.findOne(AccountTemplate, {
          where: { name: templateData.name, type: templateData.type },
        });

        if (existingTemplate) {
          await manager.update(
            AccountTemplate,
            { id: existingTemplate.id },
            templateData,
          );
        } else {
          await manager.save(AccountTemplate, templateData);
        }
      }

      return {
        code: 200,
        message: '系统初始化成功',
        data: {
          roles: savedRoles,
          adminUsername,
        },
      };
    });
  }
}
