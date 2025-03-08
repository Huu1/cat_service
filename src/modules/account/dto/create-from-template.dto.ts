import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFromTemplateDto {
  @ApiProperty({ description: '账本ID' })
  @IsNumber()
  bookId: number;

  @ApiProperty({ description: '模板ID' })
  @IsNumber()
  templateId: number;

  @ApiPropertyOptional({ description: '账户名称（可选，默认使用模板名称）' })
  @IsString()
  @IsOptional()
  name?: string;
}