import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限标识符' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '权限名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '权限描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto extends CreatePermissionDto {}