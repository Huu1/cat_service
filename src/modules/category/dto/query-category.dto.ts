import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RecordType } from '../../record/entities/record.entity';

export class QueryCategoryDto {
  @ApiPropertyOptional({ 
    enum: RecordType,
    description: '分类类型（收入/支出）' 
  })
  @IsEnum(RecordType)
  @IsOptional()
  type?: RecordType;

  @ApiPropertyOptional({ description: '分类名称' })
  @IsString()
  @IsOptional()
  name?: string;
}