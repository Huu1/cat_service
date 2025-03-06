import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class CaptchaService {
  constructor(private redisService: RedisService) {}

  async generate(key: string) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 1,
      color: false,
      background: '#ffffff'
    });

    await this.redisService.set(`captcha:${key}`, captcha.text.toLowerCase(), 300);

    return {
      image: captcha.data,
      key
    };
  }

  async verify(key: string, code: string): Promise<boolean> {
    const stored = await this.redisService.get(`captcha:${key}`);
    if (!stored) return false;
    
    await this.redisService.del(`captcha:${key}`);
    return stored === code.toLowerCase();
  }
}