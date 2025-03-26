import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from 'src/common/enums/business-error.enum';
import { AccountTemplateService } from '../account-template/account-template.service';
import { AccountType, AccountTypesMap } from './enums/account-type.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private accountTemplateService: AccountTemplateService,
  ) {}

  async create(userId: number, createAccountDto: CreateAccountDto) {
    const { bookId, ...accountData } = createAccountDto;

    if (accountData.isDefault) {
      // 如果设置为默认账户，需要取消同一账本中其他账户的默认状态
      await this.accountRepository.update(
        { book: { id: bookId }, user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    const account = this.accountRepository.create({
      ...accountData,
      user: { id: userId },
      book: { id: bookId },
    });

    return this.accountRepository.save(account);
  }

  async findAll(userId: number) {
    const where: any = { user: { id: userId } };

    return this.accountRepository.find({
      where,
      relations: ['book', 'template'],
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findAllGrouped(userId: number) {
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId } },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
      relations: ['book', 'template'],
    });

    return AccountTypesMap.map((group) => {
      const groupAccounts = accounts.filter(
        (account) => account.type === group.type,
      );
      const totalBalance = groupAccounts.reduce((sum, account) => {
        return sum + Number(account.balance || 0);
      }, 0);

      return {
        title: group.title,
        type: group.type,
        accounts: groupAccounts,
        totalBalance:
          totalBalance === 0 ? '0.00' : Number(totalBalance.toFixed(2)), // 保留两位小数
      };
    }).filter((group) => group.accounts.length > 0);
  }

  async findOne(userId: number, id: number) {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['template'], // 添加 template 关联
    });

    if (!account) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
    }

    return account;
  }

  async update(userId: number, id: number, updateAccountDto: UpdateAccountDto) {
    const account = await this.findOne(userId, id);
    const { bookId, id: accountId, ...updateData } = updateAccountDto; // 解构时排除 id 字段

    if (updateData.isDefault) {
      await this.accountRepository.update(
        {
          book: { id: bookId || account.book.id },
          user: { id: userId },
          isDefault: true,
        },
        { isDefault: false },
      );
    }

    return this.accountRepository.save({
      ...account,
      ...updateData,
      book: bookId ? { id: bookId } : account.book,
    });
  }

  async remove(userId: number, id: number) {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['records'],
    });

    if (!account) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
    }

    if (account.records?.length > 0) {
      throw new BusinessException(
        BusinessError.COMMON_ERROR,
        '该账户下存在记录，无法删除',
      );
    }

    await this.accountRepository.softRemove(account);
    return { message: '删除成功' };
  }

  // 新增方法：从模板创建账户
  async createFromTemplate(
    userId: number,
    bookId: number,
    templateId: number,
    name?: string,
    description?: string,
    icon?: string,
    balance: number = 0, // 添加初始余额参数，默认为0
  ) {
    const template = await this.accountTemplateService.copyTemplate(templateId);

    const account = this.accountRepository.create({
      name: name || template.name,
      icon: icon || template.icon,
      balance, // 使用传入的初始余额
      template,
      type: template.type,
      description,
      user: { id: userId },
      book: { id: bookId },
    });

    return this.accountRepository.save(account);
  }

  async calculateAssets(userId: number) {
    const accounts = await this.accountRepository.find({
      where: { user: { id: userId } },
    });

    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const account of accounts) {
      const balance = Number(account.balance) || 0;

      // 计算总资产
      if (
        [
          AccountType.CASH,
          AccountType.INVESTMENT,
          AccountType.RECEIVABLE,
        ].includes(account.type)
      ) {
        totalAssets += balance;
      }

      // 计算总负债
      if ([AccountType.CREDIT, AccountType.PAYABLE].includes(account.type)) {
        totalLiabilities += balance;
      }
    }

    // 计算净资产
    const netAssets = totalAssets - totalLiabilities;

    return {
      totalAssets: totalAssets === 0 ? '0.00' : Number(totalAssets.toFixed(2)),
      totalLiabilities:
        totalLiabilities === 0 ? '0.00' : Number(totalLiabilities.toFixed(2)),
      netAssets: netAssets === 0 ? '0.00' : Number(netAssets.toFixed(2)),
    };
  }

  async getAccountDetail(userId: number, id: number) {
    const account = await this.accountRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['records', 'records.category', 'template', 'book'], // 添加 records.category 关联
    });

    if (!account) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
    }

    // 按月份对记录进行分组
    const recordsByMonth = {};
    account.records.forEach((record) => {
      const monthKey = record.recordDate.toISOString().slice(0, 7);
      const dateKey = record.recordDate.toISOString().slice(0, 10);

      if (!recordsByMonth[monthKey]) {
        recordsByMonth[monthKey] = {
          income: 0,
          expense: 0,
          dailyStats: {},
        };
      }

      if (!recordsByMonth[monthKey].dailyStats[dateKey]) {
        recordsByMonth[monthKey].dailyStats[dateKey] = {
          date: dateKey,
          income: 0,
          expense: 0,
          records: [],
        };
      }

      // 修正收支计算逻辑
      const amount = Number(record.amount) || 0;
      if (record.type === 'income') {
        // 根据记录类型判断是收入还是支出
        recordsByMonth[monthKey].income += amount;
        recordsByMonth[monthKey].dailyStats[dateKey].income += amount;
      } else if (record.type === 'expense') {
        recordsByMonth[monthKey].expense += amount;
        recordsByMonth[monthKey].dailyStats[dateKey].expense += amount;
      }

      recordsByMonth[monthKey].dailyStats[dateKey].records.push(record);
    });

    // 格式化返回数据
    const monthlyStats = Object.entries(recordsByMonth).map(
      ([month, data]: any) => ({
        month,
        income: Number(data.income.toFixed(2)),
        expense: Number(data.expense.toFixed(2)),
        dailyStats: Object.values(data.dailyStats)
          .map((day: any) => ({
            ...day,
            income: Number(day.income.toFixed(2)),
            expense: Number(day.expense.toFixed(2)),
            records: day.records.sort(
              (a, b) =>
                new Date(b.recordDate).getTime() -
                new Date(a.recordDate).getTime(), // 使用 recordDate 排序
            ),
          }))
          .sort((a, b) => b.date.localeCompare(a.date)),
      }),
    );

    return monthlyStats.sort((a, b) => b.month.localeCompare(a.month));

    // return {
    //   account: {
    //     id: account.id,
    //     name: account.name,
    //     type: account.type,
    //     balance: account.balance,
    //     icon: account.icon,
    //     description: account.description,
    //     isDefault: account.isDefault,
    //     template: account.template,
    //     book: account.book
    //   },
    //   statistics: monthlyStats.sort((a, b) => b.month.localeCompare(a.month))
    // };
  }
}
