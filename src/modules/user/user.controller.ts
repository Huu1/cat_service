import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: '用户名搜索'
  })
  @ApiQuery({
    name: 'roleCode',
    required: false,
    type: String,
    description: '角色编码'
  })
  findAll(
    @Query('username') username?: string,
    @Query('roleCode') roleCode?: string
  ) {
    return this.userService.findAll({ username, roleCode });
  }
}
