import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色标识符' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '角色名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '角色描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '权限ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto extends CreateRoleDto {}