import { IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '用户名称' })
  @IsString()
  @Length(2, 50)
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '头像' })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @Length(6, 20)
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @Length(6, 20)
  newPassword: string;
}