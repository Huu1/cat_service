import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum UserStatisticsTimeRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'all'
}

export class UserStatisticsQueryDto {
  @ApiProperty({ 
    description: '时间范围', 
    enum: UserStatisticsTimeRange,
    default: UserStatisticsTimeRange.TODAY
  })
  @IsEnum(UserStatisticsTimeRange)
  @IsOptional()
  timeRange?: UserStatisticsTimeRange = UserStatisticsTimeRange.TODAY;

  @ApiProperty({ 
    description: '自定义开始日期 YYYY-MM-DD', 
    required: false 
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    description: '自定义结束日期 YYYY-MM-DD', 
    required: false 
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}