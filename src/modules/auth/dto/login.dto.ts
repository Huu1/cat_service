import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '验证码' })
  @IsString()
  @IsNotEmpty()
  captcha: string;

  @ApiProperty({ description: '验证码key' })
  @IsString()
  @IsNotEmpty()
  captchaKey: string;
}

export class LoginTestDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  code: string;
}