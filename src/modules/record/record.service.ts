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

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  async create(userId: number, createRecordDto: CreateRecordDto) {
    const { bookId, accountId, categoryId, type, amount, ...recordData } = createRecordDto;

    return await this.dataSource.transaction(async manager => {
      // 验证分类类型
      const category = await manager.findOne(Category, {
        where: { id: categoryId }
      });

      if (!category) {
        throw new BusinessException(BusinessError.NOT_FOUND, '分类不存在');
      }

      if ((category.type as any) !== type) {
        throw new BusinessException(BusinessError.COMMON_ERROR, '分类类型与记录类型不匹配');
      }

      // 检查并更新账户余额
      const account = await manager.findOne(Account, {
        where: { id: accountId, user: { id: userId } }
      });

      if (!account) {
        throw new BusinessException(BusinessError.NOT_FOUND, '账户不存在');
      }

      // 计算新余额
      const amountChange = type === 'income' ? amount : -amount;

      const newBalance = Number(account.balance) + amountChange;

      // 更新账户余额
      await manager.update(Account, accountId, { balance: newBalance });

      // 创建记录
      const record = manager.create(Record, {
        ...recordData,
        user: { id: userId },
        book: { id: bookId },
        account: { id: accountId },
        category: { id: categoryId }
      });

      return manager.save(record);
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
        book: true
      },
      order: {
        recordDate: 'DESC',
        createdAt: 'DESC'
      }
    });
  }

  async findOne(userId: number, id: number) {
    const record = await this.recordRepository.findOne({
      where: { id, user: { id: userId } },
      relations: {
        account: true,
        category: true,
        book: true
      }
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

    return await this.dataSource.transaction(async manager => {
      // 如果金额或类型发生变化，需要调整账户余额
      if (updateData.amount !== record.amount || updateData.type !== record.type) {
        // 恢复原账户余额
        const oldAmountChange = record.type === 'income' ? -record.amount : record.amount;
        await manager.increment(Account, { id: record.account.id }, 'balance', oldAmountChange);

        // 设置新账户余额
        const newAmountChange = updateData.type === 'income' ? updateData.amount : -updateData.amount;
        await manager.increment(Account, { id: accountId || record.account.id }, 'balance', newAmountChange);
      }

      return manager.save(Record, {
        ...record,
        ...updateData,
        book: bookId ? { id: bookId } : record.book,
        account: accountId ? { id: accountId } : record.account,
        category: categoryId ? { id: categoryId } : record.category
      });
    });
  }

  async remove(userId: number, id: number) {
    const record = await this.findOne(userId, id);

    // 使用事务处理记录删除和账户余额恢复
    return await this.dataSource.transaction(async manager => {
      // 恢复账户余额
      const amountChange = record.type === 'income' ? -record.amount : record.amount;
      await manager.increment(Account, { id: record.account.id }, 'balance', amountChange);

      return manager.remove(record);
    });
  }
}