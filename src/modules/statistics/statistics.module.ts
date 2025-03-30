import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Record } from '../record/entities/record.entity';
import { Account } from '../account/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record]),TypeOrmModule.forFeature([Account])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}