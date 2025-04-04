import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OnlineStatusGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    

    if (user && user.userId) {
      this.redisService.updateUserActivity(user.userId.toString());
    }

    return true; // 总是允许请求继续
  }
}