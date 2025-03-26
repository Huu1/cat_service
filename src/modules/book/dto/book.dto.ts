import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ description: '账本名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '账本描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '是否为默认账本' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: '账户图标背景色' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateBookDto extends CreateBookDto {

}
