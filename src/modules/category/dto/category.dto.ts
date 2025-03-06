import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

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

export class UpdateCategoryDto extends CreateCategoryDto {}