import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '用户昵称' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @ApiProperty({ description: '用户头像' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '用户邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;
}