import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum StatisticsType {
  MONTH = 'month',
  YEAR = 'year'
}

// 在 StatisticsQueryDto 和 StatisticsDetailQueryDto 中添加 bookId 字段
export class StatisticsQueryDto {
  @ApiProperty({ description: '账本ID', required: false })
  @IsNumber()
  @IsOptional()
  bookId?: number;
  
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

// 在现有的 DTO 文件中添加新的 DTO
export class RangeStatisticsQueryDto {
  @ApiProperty({ description: '开始日期 YYYY-MM-DD', example: '2023-01-01' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: '结束日期 YYYY-MM-DD', example: '2023-12-31' })
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ 
    description: '统计类型：按天/周/月/年', 
    enum: ['day', 'week', 'month', 'year'],
    default: 'day',
    required: false
  })
  @IsEnum(['day', 'week', 'month', 'year'])
  @IsOptional()
  type?: 'day' | 'week' | 'month' | 'year' = 'day';

  @ApiProperty({ description: '账本ID数组', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  bookIds?: number[];

  @ApiProperty({ description: '账户ID数组', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  accountIds?: number[];
}