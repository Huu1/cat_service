import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../record/entities/record.entity';
import { StatisticsQueryDto, StatisticsType } from './dto/statistics.dto';
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

    const totalIncome = Number(income?.total || 0);
    const totalExpense = Number(expense?.total || 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      period: query.type === StatisticsType.MONTH 
        ? `${query.year}-${query.month}` 
        : `${query.year}`
    };
  }
}