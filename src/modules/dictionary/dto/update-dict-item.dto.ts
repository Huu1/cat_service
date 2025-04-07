import { PartialType } from '@nestjs/swagger';
import { CreateDictItemDto } from './create-dict-item.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDictItemDto extends PartialType(CreateDictItemDto) {
  @ApiProperty({ description: '字典类型ID', required: false })
  @IsOptional()
  @IsNumber()
  dictTypeId?: number;
}