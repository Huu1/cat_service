import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateAccountTemplateDto, UpdateAccountTemplateDto } from './dto/account-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountType } from '../account/entities/account.entity';
import { AccountTemplateService } from './account-template.service';

@ApiTags('账户模板')
@Controller('account-templates')
@ApiBearerAuth()
export class AccountTemplateController {
  constructor(private readonly accountTemplateService: AccountTemplateService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '创建账户模板' })
  create(@Body() createDto: CreateAccountTemplateDto) {
    return this.accountTemplateService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取账户模板列表' })
  @ApiQuery({
    name: 'type',
    enum: AccountType,
    required: false,
    description: '账户类型（可选）'
  })
  findAll(@Query('type') type?: AccountType) {
    return this.accountTemplateService.findAll(type);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '更新账户模板' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAccountTemplateDto) {
    return this.accountTemplateService.update(+id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '删除账户模板' })
  remove(@Param('id') id: string) {
    return this.accountTemplateService.remove(+id);
  }
}