import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFromTemplateDto {
  @ApiProperty({ description: '账本ID' })
  @IsNumber()
  @IsNotEmpty()
  bookId: number;

  @ApiProperty({ description: '模板ID' })
  @IsNumber()
  @IsNotEmpty()
  templateId: number;

  @ApiProperty({ description: '账户名称（可选，默认使用模板名称）' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '账户描述（可选）' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '账户图标（可选，默认使用模板图标）' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '初始余额（可选，默认为0）', type: 'number', example: 100.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  balance: number;
}
