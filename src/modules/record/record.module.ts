import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { Record } from './entities/record.entity';
import { Account } from '../account/entities/account.entity';
import { Category } from '../category/entities/category.entity';
import { BookModule } from '../book/book.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, Account, Category]),
    forwardRef(() => BookModule),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}