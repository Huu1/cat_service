import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ description: '账户名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '账户类型', enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ description: '初始余额', required: false })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({ description: '图标', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '是否为默认账户', required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: '账本ID' })
  @IsNumber()
  bookId: number;
}

export class UpdateAccountDto {
  @ApiProperty({ description: '账户名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '账户类型', enum: AccountType, required: false })
  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @ApiProperty({ description: '余额', required: false })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({ description: '图标', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '是否为默认账户', required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ description: '账本ID', required: false })
  @IsNumber()
  @IsOptional()
  bookId?: number;
}