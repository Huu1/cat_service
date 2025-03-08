import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum StatisticsType {
  MONTH = 'month',
  YEAR = 'year'
}

export class StatisticsQueryDto {
  @ApiProperty({ description: '统计类型', enum: StatisticsType })
  @IsEnum(StatisticsType)
  type: StatisticsType;

  @ApiProperty({ description: '年份', example: 2024 })
  @IsNumber()
  year: number;

  @ApiProperty({ description: '月份', required: false, example: 3 })
  @IsNumber()
  @IsOptional()
  month?: number;
}