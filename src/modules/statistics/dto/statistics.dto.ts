import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

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

// 在 StatisticsDetailQueryDto 中添加分页参数
export class StatisticsDetailQueryDto extends StatisticsQueryDto {
  @ApiProperty({ description: '是否包含记录详情', required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeRecords?: boolean;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 10;
}