import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChangePasswordDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '获取用户信息' })
  @Get('profile')
  @Roles('user')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.userId);
  }
}
