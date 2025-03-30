import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../record/entities/record.entity';
import {
  RangeStatisticsQueryDto,
  StatisticsDetailQueryDto,
  StatisticsQueryDto,
  StatisticsType,
} from './dto/statistics.dto';
import { RecordType } from '../record/entities/record.entity';
import { Account } from '../account/entities/account.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async getStatistics(userId: number, query: StatisticsQueryDto) {
    const queryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user.id = :userId', { userId });

    // 添加账本筛选条件
    if (query.bookId) {
      queryBuilder.andWhere('record.book.id = :bookId', {
        bookId: query.bookId,
      });
    }

    // 根据年份筛选
    queryBuilder.andWhere('YEAR(record.recordDate) = :year', {
      year: query.year,
    });

    // 如果是按月统计，添加月份筛选
    if (query.type === StatisticsType.MONTH && query.month) {
      queryBuilder.andWhere('MONTH(record.recordDate) = :month', {
        month: query.month,
      });
    }

    // 分别统计收入和支出
    const [income, expense] = await Promise.all([
      queryBuilder
        .clone()
        .andWhere('record.type = :type', { type: RecordType.INCOME })
        .select('SUM(record.amount)', 'total')
        .getRawOne(),
      queryBuilder
        .clone()
        .andWhere('record.type = :type', { type: RecordType.EXPENSE })
        .select('SUM(record.amount)', 'total')
        .getRawOne(),
    ]);

    const totalIncome = Number(income?.total || 0).toFixed(2);
    const totalExpense = Number(expense?.total || 0).toFixed(2);

    return {
      totalIncome: Number(totalIncome),
      totalExpense: Number(totalExpense),
      balance: Number((Number(totalIncome) - Number(totalExpense)).toFixed(2)),
      period:
        query.type === StatisticsType.MONTH
          ? `${query.year}-${query.month}`
          : `${query.year}`,
    };
  }

  async getStatisticsDetail(userId: number, query: StatisticsDetailQueryDto) {
    const queryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user.id = :userId', { userId })
      .andWhere('YEAR(record.recordDate) = :year', { year: query.year });

    // 添加账本筛选条件
    if (query.bookId) {
      queryBuilder.andWhere('record.book.id = :bookId', {
        bookId: query.bookId,
      });
    }

    if (query.type === StatisticsType.MONTH && query.month) {
      queryBuilder.andWhere('MONTH(record.recordDate) = :month', {
        month: query.month,
      });
    }

    const groupByFormat =
      query.type === StatisticsType.MONTH
        ? 'DATE_FORMAT(record.recordDate, "%Y-%m-%d")'
        : 'DATE_FORMAT(record.recordDate, "%Y-%m")';

    // 先获取所有不同的日期数量
    const dateCountQuery = queryBuilder
      .clone()
      .select(`COUNT(DISTINCT ${groupByFormat})`, 'count')
      .getRawOne();

    // 应用分页
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const details = await queryBuilder
      .select([
        `${groupByFormat} AS date`,
        'SUM(CASE WHEN record.type = :incomeType THEN record.amount ELSE 0 END) AS income',
        'SUM(CASE WHEN record.type = :expenseType THEN record.amount ELSE 0 END) AS expense',
      ])
      .setParameters({
        incomeType: RecordType.INCOME,
        expenseType: RecordType.EXPENSE,
      })
      .groupBy('date')
      .orderBy('date', 'DESC') // 改为 DESC 降序排列
      .offset(skip)
      .limit(pageSize)
      .getRawMany();

    // 获取总日期数
    const { count } = await dateCountQuery;
    const totalDates = Number(count);

    // 如果需要包含记录详情
    if (query.includeRecords) {
      for (const detail of details) {
        const recordsQuery = this.recordRepository
          .createQueryBuilder('record')
          .where('record.user.id = :userId', { userId })
          .andWhere('YEAR(record.recordDate) = :year', { year: query.year })
          .andWhere(`${groupByFormat} = :date`, { date: detail.date });

        // 添加账本筛选条件
        if (query.bookId) {
          recordsQuery.andWhere('record.book.id = :bookId', {
            bookId: query.bookId,
          });
        }

        const records = await recordsQuery
          .leftJoinAndSelect('record.category', 'category')
          .leftJoinAndSelect('record.account', 'account')
          .select([
            'record',
            'category.id',
            'category.name',
            'category.type',
            'category.icon',
            'account.id',
            'account.name',
            'account.type',
            'account.balance',
            'account.icon',
          ])
          .orderBy('record.recordDate', 'DESC')
          .addOrderBy('record.createdAt', 'DESC')
          .getMany();

        detail.records = records;
      }
    }

    return {
      period:
        query.type === StatisticsType.MONTH
          ? `${query.year}-${query.month}`
          : `${query.year}`,
      pagination: {
        total: totalDates,
        page,
        pageSize,
        totalPages: Math.ceil(totalDates / pageSize),
      },
      details: details.map((detail) => ({
        date: detail.date,
        income: Number(Number(detail.income).toFixed(2)),
        expense: Number(Number(detail.expense).toFixed(2)),
        balance: Number(
          (Number(detail.income) - Number(detail.expense)).toFixed(2),
        ),
        ...(query.includeRecords && { records: detail.records }),
      })),
    };
  }

  async getRangeStatistics(userId: number, query: RangeStatisticsQueryDto) {
    const { startDate, endDate, bookIds, accountIds } = query;

    // 基础查询构建器
    const baseQueryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user.id = :userId', { userId })
      .andWhere('record.recordDate >= :startDate', { startDate })
      .andWhere('record.recordDate <= :endDate', { endDate });

    // 添加账本筛选
    if (bookIds && bookIds.length > 0) {
      baseQueryBuilder.andWhere('record.book.id IN (:...bookIds)', { bookIds });
    }

    // 添加账户筛选
    if (accountIds && accountIds.length > 0) {
      baseQueryBuilder.andWhere('record.account.id IN (:...accountIds)', {
        accountIds,
      });
    }

    // 1. 统计总收入和总支出
    const [income, expense] = await Promise.all([
      baseQueryBuilder
        .clone()
        .andWhere('record.type = :type', { type: 'income' })
        .select('SUM(record.amount)', 'total')
        .getRawOne(),
      baseQueryBuilder
        .clone()
        .andWhere('record.type = :type', { type: 'expense' })
        .select('SUM(record.amount)', 'total')
        .getRawOne(),
    ]);

    const totalIncome = Number(income?.total || 0);
    const totalExpense = Number(expense?.total || 0);
    const balance = totalIncome - totalExpense;

    // 2. 按分类统计收入
    const incomeByCategory = await baseQueryBuilder
      .clone()
      .andWhere('record.type = :type', { type: 'income' })
      .leftJoinAndSelect('record.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'category.icon as categoryIcon',
        'SUM(record.amount) as total',
      ])
      .groupBy('category.id')
      .orderBy('total', 'DESC')
      .getRawMany();

    // 3. 按分类统计支出
    const expenseByCategory = await baseQueryBuilder
      .clone()
      .andWhere('record.type = :type', { type: 'expense' })
      .leftJoinAndSelect('record.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'category.icon as categoryIcon',
        'SUM(record.amount) as total',
      ])
      .groupBy('category.id')
      .orderBy('total', 'DESC')
      .getRawMany();

    // 4. 获取每个分类的记录详情
    // 修改返回结构，将记录详情整合到分类中
    const incomeCategories = [];
    for (const category of incomeByCategory) {
      const records = await baseQueryBuilder
        .clone()
        .andWhere('record.type = :type', { type: 'income' })
        .andWhere('record.category.id = :categoryId', {
          categoryId: category.categoryId,
        })
        .leftJoinAndSelect('record.category', 'category')
        .leftJoinAndSelect('record.account', 'account')
        .leftJoinAndSelect('record.book', 'book')
        .orderBy('record.recordDate', 'DESC')
        .getMany();

      incomeCategories.push({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryIcon: category.categoryIcon,
        total: Number(Number(category.total).toFixed(2)),
        records,
      });
    }

    const expenseCategories = [];
    for (const category of expenseByCategory) {
      const records = await baseQueryBuilder
        .clone()
        .andWhere('record.type = :type', { type: 'expense' })
        .andWhere('record.category.id = :categoryId', {
          categoryId: category.categoryId,
        })
        .leftJoinAndSelect('record.category', 'category')
        .leftJoinAndSelect('record.account', 'account')
        .leftJoinAndSelect('record.book', 'book')
        .orderBy('record.recordDate', 'DESC')
        .getMany();

      expenseCategories.push({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryIcon: category.categoryIcon,
        total: Number(Number(category.total).toFixed(2)),
        records,
      });
    }

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        balance: Number(balance.toFixed(2)),
      },
      incomeCategories,
      expenseCategories,
    };
  }

  async getDailyTrend(userId: number, query: RangeStatisticsQueryDto) {
    const { startDate, endDate, bookIds, accountIds, type = 'day' } = query;

    // 基础查询构建器
    const baseQueryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .where('record.user.id = :userId', { userId })
      .andWhere('record.recordDate >= :startDate', { startDate })
      .andWhere('record.recordDate <= :endDate', { endDate });

    // 添加账本筛选
    if (bookIds && bookIds.length > 0) {
      baseQueryBuilder.andWhere('record.book.id IN (:...bookIds)', { bookIds });
    }

    // 添加账户筛选
    if (accountIds && accountIds.length > 0) {
      baseQueryBuilder.andWhere('record.account.id IN (:...accountIds)', {
        accountIds,
      });
    }

    // 根据类型选择不同的日期格式和分组
    let dateFormat, nameFormat;
    switch (type) {
      case 'week':
        dateFormat = 'DATE_FORMAT(record.recordDate, "%Y-%u")';
        nameFormat =
          'CASE WEEKDAY(record.recordDate) ' +
          'WHEN 0 THEN "周一" ' +
          'WHEN 1 THEN "周二" ' +
          'WHEN 2 THEN "周三" ' +
          'WHEN 3 THEN "周四" ' +
          'WHEN 4 THEN "周五" ' +
          'WHEN 5 THEN "周六" ' +
          'WHEN 6 THEN "周日" END';
        break;
      case 'month':
        dateFormat = 'DATE_FORMAT(record.recordDate, "%Y-%m")';
        nameFormat = 'DATE_FORMAT(record.recordDate, "%d")';
        break;
      case 'year':
        dateFormat = 'DATE_FORMAT(record.recordDate, "%Y")';
        nameFormat = 'CONCAT(DATE_FORMAT(record.recordDate, "%c"), "月")';
        break;
      default: // day
        dateFormat = 'DATE_FORMAT(record.recordDate, "%Y-%m-%d")';
        nameFormat = 'DATE_FORMAT(record.recordDate, "%Y-%m-%d")';
    }

    // 按日期分组查询每日收支
    const stats = await baseQueryBuilder
      .select([
        `${dateFormat} AS date`,
        `${nameFormat} AS name`,
        'SUM(CASE WHEN record.type = :incomeType THEN record.amount ELSE 0 END) AS income',
        'SUM(CASE WHEN record.type = :expenseType THEN record.amount ELSE 0 END) AS expense',
      ])
      .setParameters({
        incomeType: 'income',
        expenseType: 'expense',
      })
      .groupBy('date, name')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 生成完整的日期范围并填充数据
    const result = [];

    // 根据不同类型生成日期范围
    if (type === 'day') {
      // 按天生成日期范围
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dateMap = new Map(stats.map((item) => [item.date, item]));

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const existingData = dateMap.get(dateStr);

        result.push({
          date: dateStr,
          name: dateStr,
          income: existingData
            ? Number(Number(existingData.income).toFixed(2))
            : 0,
          expense: existingData
            ? Number(Number(existingData.expense).toFixed(2))
            : 0,
        });
      }
    } else if (type === 'month') {
      // 按月内日期生成范围
      const [year, month] = startDate.split('-').slice(0, 2);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      const datePrefix = `${year}-${month}`;
      const dateMap = new Map(stats.map((item) => [item.name, item]));

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const existingData = dateMap.get(dayStr);

        result.push({
          date: `${datePrefix}`,
          name: dayStr,
          income: existingData
            ? Number(Number(existingData.income).toFixed(2))
            : 0,
          expense: existingData
            ? Number(Number(existingData.expense).toFixed(2))
            : 0,
        });
      }
    } else if (type === 'year') {
      // 按年内月份生成范围
      const year = startDate.split('-')[0];
      const monthNames = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ];
      const monthMap = new Map(stats.map((item) => [item.name, item]));

      for (const monthName of monthNames) {
        const existingData = monthMap.get(monthName);

        result.push({
          date: year,
          name: monthName,
          income: existingData
            ? Number(Number(existingData.income).toFixed(2))
            : 0,
          expense: existingData
            ? Number(Number(existingData.expense).toFixed(2))
            : 0,
        });
      }
    } else if (type === 'week') {
      // 按周内天生成范围
      const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const weekMap = new Map(stats.map((item) => [item.name, item]));

      // 获取当前查询的周标识
      const weekIdentifier = stats.length > 0 ? stats[0].date : null;

      for (const weekDay of weekDays) {
        const existingData = weekMap.get(weekDay);

        result.push({
          date: weekIdentifier || startDate.substring(0, 7), // 如果没有数据，使用开始日期的年月
          name: weekDay,
          income: existingData
            ? Number(Number(existingData.income).toFixed(2))
            : 0,
          expense: existingData
            ? Number(Number(existingData.expense).toFixed(2))
            : 0,
        });
      }
    }

    return result;
  }

 
  
  // 生成日期范围的辅助方法
  private generateDateRange(startDate: string, endDate: string, type: string) {
    const result = [];
    
    if (type === 'day') {
      // 按天生成日期范围
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        result.push({
          date: dateStr,
          name: dateStr
        });
      }
    } else if (type === 'month') {
      // 按月内日期生成范围
      const [year, month] = startDate.split('-').slice(0, 2);
      const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
      const datePrefix = `${year}-${month}`;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        result.push({
          date: `${datePrefix}-${dayStr}`,
          name: dayStr
        });
      }
    } else if (type === 'year') {
      // 按年内月份生成范围
      const year = startDate.split('-')[0];
      
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const lastDay = new Date(Number(year), month, 0).getDate();
        result.push({
          date: `${year}-${monthStr}-${lastDay}`, // 使用每月最后一天
          name: `${month}月`
        });
      }
    } else if (type === 'week') {
      // 按周内天生成范围
      const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const start = new Date(startDate);
      
      // 调整到本周一
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          name: weekDays[i]
        });
      }
    }
    
    return result;
  }


  async getAssetsTrend(userId: number, query: RangeStatisticsQueryDto) {
    const { startDate, endDate, bookIds, accountIds, type = 'day' } = query;
    
    // 生成日期范围
    const dateRange = this.generateDateRange(startDate, endDate, type);
    
    // 查询所有账户信息
    const accountQueryBuilder = this.accountRepository.createQueryBuilder('account')
      .leftJoinAndSelect('account.book', 'book')
      .where('account.user.id = :userId', { userId });
    
    // 添加账本筛选
    if (bookIds && bookIds.length > 0) {
      accountQueryBuilder.andWhere('book.id IN (:...bookIds)', { bookIds });
    }
    
    // 添加账户筛选
    if (accountIds && accountIds.length > 0) {
      accountQueryBuilder.andWhere('account.id IN (:...accountIds)', { accountIds });
    }
    
    const accounts = await accountQueryBuilder.getMany();
    
    // 查询所有记录
    const recordQueryBuilder = this.recordRepository.createQueryBuilder('record')
      .leftJoinAndSelect('record.account', 'account')
      .where('record.user.id = :userId', { userId })
      .andWhere('record.recordDate <= :endDate', { endDate });
    
    // 添加账本筛选
    if (bookIds && bookIds.length > 0) {
      recordQueryBuilder.andWhere('record.book.id IN (:...bookIds)', { bookIds });
    }
    
    // 添加账户筛选
    if (accountIds && accountIds.length > 0) {
      recordQueryBuilder.andWhere('record.account.id IN (:...accountIds)', { accountIds });
    }
    
    const allRecords = await recordQueryBuilder.getMany();
    
    // 按日期计算资产负债
    const result = [];
    
    for (const dateItem of dateRange) {
      const currentDate = dateItem.date;
      let totalAssets = 0;
      let totalLiabilities = 0;
      
      // 计算每个账户在当前日期的余额
      for (const account of accounts) {
        // 获取账户当前余额
        const currentBalance = Number(account.balance) || 0;
        
        // 筛选出该账户在当前日期之后的所有交易记录
        // 注意：这里假设account.balance是最新余额，需要反向计算历史余额
        const futureRecords = allRecords.filter(record => 
          record.account.id === account.id && 
          new Date(record.recordDate) > new Date(currentDate)
        );
        
        // 反向计算历史余额
        let historicalBalance = currentBalance;
        for (const record of futureRecords) {
          if (record.type === 'income') {
            historicalBalance -= Number(record.amount); // 反向计算，收入需要减去
          } else if (record.type === 'expense') {
            historicalBalance += Number(record.amount); // 反向计算，支出需要加上
          }
        }
        
        // 根据账户类型判断是资产还是负债
        const accountType = (account.type || '').toUpperCase();
        if (['CASH', 'INVESTMENT', 'RECEIVABLE', 'CHECKING', 'SAVINGS'].includes(accountType)) {
          totalAssets += historicalBalance;
        } else if (['CREDIT', 'PAYABLE', 'LOAN', 'DEBT'].includes(accountType)) {
          totalLiabilities += Math.abs(historicalBalance);
        }
      }
      
      // 计算净资产
      const netAssets = totalAssets - totalLiabilities;
      
      // 添加到结果数组
      result.push({
        date: dateItem.date,
        name: dateItem.name,
        totalAssets: Number(totalAssets.toFixed(2)),
        totalLiabilities: Number(totalLiabilities.toFixed(2)),
        netAssets: Number(netAssets.toFixed(2))
      });
    }
    
    return result;
  }
}



