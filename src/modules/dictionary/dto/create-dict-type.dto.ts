import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典类型编码' })
  @IsString()
  @Length(1, 100)
  code: string;

  @ApiProperty({ description: '字典类型名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '字典类型描述', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: '是否启用', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}