import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { Record } from './entities/record.entity';
import { Account } from '../account/entities/account.entity';
import { RedisModule } from '../redis/redis.module'; // 添加这一行
import { Category } from '../category/entities/category.entity';
import { BookModule } from '../book/book.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Account, Category]),
    forwardRef(() => BookModule),
    RedisModule
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}