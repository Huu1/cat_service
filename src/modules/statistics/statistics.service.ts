import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../record/entities/record.entity';
import { StatisticsDetailQueryDto, StatisticsQueryDto, StatisticsType } from './dto/statistics.dto';
import { RecordType } from '../record/entities/record.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
  ) {}

  async getStatistics(userId: number, query: StatisticsQueryDto) {
    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .where('record.user.id = :userId', { userId });

    // 根据年份筛选
    queryBuilder.andWhere('YEAR(record.recordDate) = :year', { year: query.year });

    // 如果是按月统计，添加月份筛选
    if (query.type === StatisticsType.MONTH && query.month) {
      queryBuilder.andWhere('MONTH(record.recordDate) = :month', { month: query.month });
    }

    // 分别统计收入和支出
    const [income, expense] = await Promise.all([
      queryBuilder.clone()
        .andWhere('record.type = :type', { type: RecordType.INCOME })
        .select('SUM(record.amount)', 'total')
        .getRawOne(),
      queryBuilder.clone()
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
      period: query.type === StatisticsType.MONTH 
        ? `${query.year}-${query.month}` 
        : `${query.year}`
    };
  }

  async getStatisticsDetail(userId: number, query: StatisticsDetailQueryDto) {
    const queryBuilder = this.recordRepository.createQueryBuilder('record')
      .where('record.user.id = :userId', { userId })
      .andWhere('YEAR(record.recordDate) = :year', { year: query.year });

    if (query.type === StatisticsType.MONTH && query.month) {
      queryBuilder.andWhere('MONTH(record.recordDate) = :month', { month: query.month });
    }

    const groupByFormat = query.type === StatisticsType.MONTH
      ? 'DATE_FORMAT(record.recordDate, "%Y-%m-%d")'
      : 'DATE_FORMAT(record.recordDate, "%Y-%m")';

    // 先获取所有不同的日期数量
    const dateCountQuery = queryBuilder.clone()
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
        expenseType: RecordType.EXPENSE
      })
      .groupBy('date')
      .orderBy('date', 'DESC')  // 改为 DESC 降序排列
      .offset(skip)
      .limit(pageSize)
      .getRawMany();

    // 获取总日期数
    const { count } = await dateCountQuery;
    const totalDates = Number(count);

    // 如果需要包含记录详情
    if (query.includeRecords) {
      for (const detail of details) {
        const records = await this.recordRepository.createQueryBuilder('record')
          .where('record.user.id = :userId', { userId })
          .andWhere('YEAR(record.recordDate) = :year', { year: query.year })
          .andWhere(`${groupByFormat} = :date`, { date: detail.date })
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
            'account.icon'
          ])
          .orderBy('record.recordDate', 'DESC')
          .addOrderBy('record.createdAt', 'DESC')
          .getMany();
  
        detail.records = records;
      }
    }
  
    return {
      period: query.type === StatisticsType.MONTH 
        ? `${query.year}-${query.month}` 
        : `${query.year}`,
      pagination: {
        total: totalDates,
        page,
        pageSize,
        totalPages: Math.ceil(totalDates / pageSize)
      },
      details: details.map(detail => ({
        date: detail.date,
        income: Number(Number(detail.income).toFixed(2)),
        expense: Number(Number(detail.expense).toFixed(2)),
        balance: Number((Number(detail.income) - Number(detail.expense)).toFixed(2)),
        ...(query.includeRecords && { records: detail.records })
      }))
    };
  }
}