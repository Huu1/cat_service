import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Record } from './entities/record.entity';
import { Account } from '../account/entities/account.entity';
import { CreateRecordDto, UpdateRecordDto } from './dto/record.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';
import Decimal from 'decimal.js';
import { Category } from '../category/entities/category.entity';
import { RedisService } from '../redis/redis.service'; // 添加这一行

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource,
    private redisService: RedisService, // 添加 RedisService
  ) {}

  async create(userId: number, createRecordDto: CreateRecordDto) {
    const { bookId, accountId, categoryId, type, amount, ...recordData } =
      createRecordDto;

    return await this.dataSource.transaction(async (manager) => {
      // 验证分类类型
      const category = await manager.findOne(Category, {
        where: { id: categoryId },
      });

      if (!category) {
        throw new BusinessException(BusinessError.NOT_FOUND, '分类不存在');
      }

      if ((category.type as any) !== type) {
        throw new BusinessException(
          BusinessError.COMMON_ERROR,
          '分类类型与记录类型不匹配',
        );
      }

      // 如果提供了账户ID，则更新账户余额
      let account = null;
      if (accountId) {
        // 检查并更新账户余额
        account = await manager.findOne(Account, {
          where: { id: accountId, user: { id: userId } },
        });

        if (!account) {
          throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
        }

        // 计算新余额，根据账户类型处理
        let amountChange;
        
        // 对于信用类账户（如信用卡），收入表示还款（减少负债），支出表示消费（增加负债）
        if (['CREDIT', 'PAYABLE'].includes(account.type)) {
          amountChange = type === 'income' ? -amount : amount;
        } else {
          // 对于资产类账户，收入增加余额，支出减少余额
          amountChange = type === 'income' ? amount : -amount;
        }

        const newBalance = Number(account.balance) + amountChange;

        // 更新账户余额
        await manager.update(Account, accountId, { balance: newBalance });
      }

      // 创建记录
      const record = manager.create(Record, {
        ...recordData,
        type,      // 添加 type
        amount,    // 添加 amount
        user: { id: userId },
        book: { id: bookId },
        account: accountId ? { id: accountId } : null,
        category: { id: categoryId },
      });

      const savedRecord = await manager.save(record);
      
      // 记录用户记账行为到 Redis
      await this.redisService.recordUserBookkeeping(userId.toString());
      
      return savedRecord;
    });
  }

  async findAll(userId: number, bookId?: number) {
    const where: any = { user: { id: userId } };
    if (bookId) {
      where.book = { id: bookId };
    }

    return this.recordRepository.find({
      where,
      relations: {
        account: true,
        category: true,
        book: true,
      },
      order: {
        recordDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const record = await this.recordRepository.findOne({
      where: { id, user: { id: userId } },
      relations: {
        account: true,
        category: true,
        book: true,
      },
    });

    if (!record) {
      throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
      // 和
      throw new BusinessException(BusinessError.NOT_FOUND, '记录不存在');
    }

    return record;
  }

  async update(userId: number, id: number, updateRecordDto: UpdateRecordDto) {
    const record = await this.findOne(userId, id);
    const { bookId, accountId, categoryId, ...updateData } = updateRecordDto;

    return await this.dataSource.transaction(async (manager) => {
      // 如果记录原来有账户，并且金额或类型发生变化，或者账户发生变化，需要调整账户余额
      if (record.account && (
        updateData.amount !== record.amount ||
        updateData.type !== record.type ||
        accountId !== (record.account?.id || null)
      )) {
        // 获取原账户信息
        const oldAccount = await manager.findOne(Account, {
          where: { id: record.account.id },
        });

        // 恢复原账户余额
        const oldAmountChange = ['CREDIT', 'PAYABLE'].includes(oldAccount.type)
          ? (record.type === 'income' ? record.amount : -record.amount)
          : (record.type === 'income' ? -record.amount : record.amount);

        await manager.increment(
          Account,
          { id: record.account.id },
          'balance',
          oldAmountChange,
        );

        // 如果新记录也有账户，设置新账户余额
        if (accountId) {
          // 获取新账户信息
          const newAccount = await manager.findOne(Account, { 
            where: { id: accountId } 
          });

          const newAmountChange = ['CREDIT', 'PAYABLE'].includes(newAccount.type)
            ? (updateData.type === 'income' ? -updateData.amount : updateData.amount)
            : (updateData.type === 'income' ? updateData.amount : -updateData.amount);

          await manager.increment(
            Account,
            { id: accountId },
            'balance',
            newAmountChange,
          );
        }
      } 
      // 如果记录原来没有账户，但新记录有账户
      else if (!record.account && accountId) {
        // 获取新账户信息
        const newAccount = await manager.findOne(Account, { 
          where: { id: accountId } 
        });

        const newAmountChange = ['CREDIT', 'PAYABLE'].includes(newAccount.type)
          ? (updateData.type === 'income' ? -updateData.amount : updateData.amount)
          : (updateData.type === 'income' ? updateData.amount : -updateData.amount);

        await manager.increment(
          Account,
          { id: accountId },
          'balance',
          newAmountChange,
        );
      }

      return manager.save(Record, {
        ...record,
        ...updateData,
        book: bookId ? { id: bookId } : record.book,
        account: accountId ? { id: accountId } : null,
        category: categoryId ? { id: categoryId } : record.category,
      });
    });
  }

  async remove(userId: number, id: number) {
    const record = await this.findOne(userId, id);

    return await this.dataSource.transaction(async (manager) => {
      // 如果记录有关联账户，恢复账户余额
      if (record.account) {
        // 获取账户信息
        const account = await manager.findOne(Account, {
          where: { id: record.account.id },
        });

        // 恢复账户余额
        const amountChange = ['CREDIT', 'PAYABLE'].includes(account.type)
          ? (record.type === 'income' ? record.amount : -record.amount)
          : (record.type === 'income' ? -record.amount : record.amount);

        await manager.increment(
          Account,
          { id: record.account.id },
          'balance',
          amountChange,
        );
      }

      return await manager.softRemove(record);
    });
  }

  async getAccount(userId: number, accountId: number) {
      const account = await this.accountRepository.findOne({
        where: { id: accountId, user: { id: userId } },
      });
  
      if (!account) {
        throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
      }
  
      return account;
    }
}
