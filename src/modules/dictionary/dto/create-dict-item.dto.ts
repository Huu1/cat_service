import { IsString, IsNumber, IsBoolean, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDictItemDto {
  @ApiProperty({ description: '字典类型ID' })
  @IsNumber()
  dictTypeId: number;

  @ApiProperty({ description: '字典项编码' })
  @IsString()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: '字典项标签' })
  @IsString()
  @Length(1, 100)
  label: string;

  @ApiProperty({ description: '字典项值' })
  @IsString()
  @Length(1, 255)
  value: string;

  @ApiProperty({ description: '排序号', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '字典项描述', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: '附加数据', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  additionalData?: string;
}