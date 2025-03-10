import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CaptchaService } from './captcha.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private captchaService: CaptchaService,
  ) {}

  async validateCaptcha(key: string, code: string) {
    const isValid = await this.captchaService.verify(key, code);
    if (!isValid) {
      throw new BusinessException(
        BusinessError.CAPTCHA_ERROR,
        '验证码错误或已过期',
      );
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles.map((role) => role.name),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async generateToken(user: User) {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles.map((role) => role.name),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  async loginWithWechat(code: string) {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`,
      );

      if (response.data.errcode) {
        throw new UnauthorizedException('微信登录失败');
      }

      const { openid } = response.data;
      let user = await this.userService.findByOpenid(openid);

      if (!user) {
        // 生成默认用户名和随机密码
        const username = `wx_${openid.slice(-8)}`;
        const password = this.generateRandomPassword();
        
        user = await this.userService.createWithRole(
          { 
            openid,
            username,
            password, // 添加密码
            isActive: true 
          }, 
          ['user']
        );
      }

      const token = await this.generateToken(user);
      return {
        user,
        access_token: token.access_token,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('微信登录失败');
    }
  }
  
  // 删除不需要的 wxLogin 方法，使用上面的 loginWithWechat 方法代替
  
  // 生成随机密码
  private generateRandomPassword(): string {
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }
}
