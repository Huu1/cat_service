import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateFromTemplateDto } from './dto/create-from-template.dto';

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
  @ApiOperation({ summary: '获取账户列表（按类型分组）' })
  findAll(
    @CurrentUser() user: JwtPayload
  ) {
    return this.accountService.findAllGrouped(user.userId);
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

  @Post('from-template')
  @ApiOperation({ summary: '从模板创建账户' })
  createFromTemplate(
    @CurrentUser() user: JwtPayload,
    @Body() createFromTemplateDto: CreateFromTemplateDto
  ) {
    return this.accountService.createFromTemplate(
      user.userId, 
      createFromTemplateDto.bookId, 
      createFromTemplateDto.templateId,
      createFromTemplateDto.name,
      createFromTemplateDto.description,
      createFromTemplateDto.icon,
    );
  }

  @Get('assets/summary')
  @ApiOperation({ summary: '获取资产概览（总资产、总负债、净资产）' })
  getAssetsSummary(@CurrentUser() user: JwtPayload) {
    return this.accountService.calculateAssets(user.userId);
  }
}