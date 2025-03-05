import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log, LogType } from './entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async create(data: {
    userId: number;
    username: string;
    type: LogType;
    action: string;
    detail?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const log = this.logRepository.create(data);
    return this.logRepository.save(log);
  }

  async findAll(page = 1, limit = 10) {
    const [items, total] = await this.logRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }  // 使用实体类中定义的字段名
    });

    return {
      items,
      total,
      page,
      pageSize: limit
    };
  }
}