import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('账户')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: '创建账户' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createAccountDto: CreateAccountDto
  ) {
    return this.accountService.create(user.userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: '获取账户列表' })
  findAll(
    @CurrentUser() user: JwtPayload
  ) {
    return this.accountService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定账户' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string
  ) {
    return this.accountService.findOne(user.userId, +id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新账户' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto
  ) {
    return this.accountService.update(user.userId, +id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除账户' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string
  ) {
    return this.accountService.remove(user.userId, +id);
  }
}