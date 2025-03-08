import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

// CreateCategoryDto 保持不变
export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '分类类型', enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: '图标', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '排序', required: false })
  @IsNumber()
  @IsOptional()
  sort?: number;
}

// 先创建一个不包含 type 的基础 DTO
export class CategoryWithoutTypeDto extends OmitType(CreateCategoryDto, ['type'] as const) {}

// 然后基于这个 DTO 创建更新 DTO
export class UpdateCategoryDto extends PartialType(CategoryWithoutTypeDto) {}