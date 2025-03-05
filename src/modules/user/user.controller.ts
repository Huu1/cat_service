import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '获取用户信息' })
  @Get('profile')
  @Roles('user')  // 允许管理员和普通用户都能访问
  async getProfile(@CurrentUser() user:JwtPayload) {
    
    const userInfo = await this.userService.findById(user.userId);
    return {
      code: 200,
      data: userInfo,
      message: '获取用户信息成功'
    };
  }
}
