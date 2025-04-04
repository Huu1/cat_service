import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateAccountTemplateDto,
  UpdateAccountTemplateDto,
} from './dto/account-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AccountType,
  AccountTypesMap,
} from '../account/enums/account-type.enum';
import { AccountTemplateService } from './account-template.service';

@ApiTags('账户模板')
@Controller('account-templates')
@ApiBearerAuth()
export class AccountTemplateController {
  constructor(
    private readonly accountTemplateService: AccountTemplateService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建账户模板' })
  create(@Body() createDto: CreateAccountTemplateDto) {
    return this.accountTemplateService.create(createDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取账户模板列表（不分组）' })
  @ApiQuery({
    name: 'type',
    enum: AccountType,
    required: false,
    description: '账户类型（可选）',
  })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
    description: '模板名称（可选）',
  })
  getList(@Query('type') type?: AccountType, @Query('name') name?: string) {
    return this.accountTemplateService.findAll({ type, name });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取账户模板列表（按类型分组）' })
  @ApiQuery({
    name: 'type',
    enum: AccountType,
    required: false,
    description: '账户类型（可选）',
  })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
    description: '模板名称（可选）',
  })
  async findAll(
    @Query('type') type?: AccountType,
    @Query('name') name?: string,
  ) {
    const templates = await this.accountTemplateService.findAll({ type, name });

    if (type) {
      // 如果指定了类型，直接返回该类型的模板
      const typeInfo = AccountTypesMap.find((t) => t.type === type);
      return {
        title: typeInfo.title,
        type: typeInfo.type,
        templates: templates,
      };
    }

    // 按类型分组返回
    return AccountTypesMap.map((group) => ({
      title: group.title,
      type: group.type,
      templates: templates.filter((template) => template.type === group.type),
    })).filter((group) => group.templates.length > 0); // 只返回有模板的分组
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新账户模板' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAccountTemplateDto) {
    return this.accountTemplateService.update(+id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '删除账户模板' })
  remove(@Param('id') id: string) {
    return this.accountTemplateService.remove(+id);
  }
}
