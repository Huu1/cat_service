import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { LoginDto, LoginTestDto, WechatLoginDto } from './dto/login.dto';
import { LogService } from '../log/log.service';
import { LogType } from '../log/entities/log.entity';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private captchaService: CaptchaService,
    private logService: LogService,
  ) {}

  @ApiOperation({ summary: '获取验证码' })
  @Get('captcha')
  async getCaptcha() {
    const key = uuidv4();
    return this.captchaService.generate(key);
  }

  @ApiOperation({ summary: '账号密码验证码登录' })
  @Post('captcha-login')
  async captchaLogin(@Body() loginDto: LoginDto) {
    await this.authService.validateCaptcha(
      loginDto.captchaKey,
      loginDto.captcha,
    );
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @ApiOperation({ summary: '测试登陆' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  @Post('login')
  async login(@Body() loginDto: LoginTestDto, @Req() request: Request) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 记录登录日志
    await this.logService.create({
      userId: user.id,
      username: user.username,
      type: LogType.LOGIN,
      action: '账号密码登录',
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return this.authService.login(user);
  }

  @ApiOperation({ summary: '微信小程序登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @Post('login/wechat')
  async loginWithWechat(
    @Body() wechatLoginDto: WechatLoginDto,
    @Req() request: Request,
  ) {
    const { user, access_token } = await this.authService.loginWithWechat(
      wechatLoginDto.code,
    );

    // 记录微信登录日志
    await this.logService.create({
      userId: user.id,
      username: user.username || '微信用户',
      type: LogType.LOGIN,
      action: '微信小程序登录',
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return { access_token };
  }
}
