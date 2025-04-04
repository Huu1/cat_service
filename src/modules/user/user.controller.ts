import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: '获取用户信息' })
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: '用户名搜索',
  })
  @ApiQuery({
    name: 'roleCode',
    required: false,
    type: String,
    description: '角色编码',
  })
  findAll(
    @Query('username') username?: string,
    @Query('roleCode') roleCode?: string,
  ) {
    return this.userService.findAll({ username, roleCode });
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserInfo(user.userId, updateUserDto);
  }
}
