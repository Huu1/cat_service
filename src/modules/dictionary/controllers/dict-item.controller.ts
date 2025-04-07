import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DictItemService } from '../services/dict-item.service';
import { CreateDictItemDto } from '../dto/create-dict-item.dto';
import { UpdateDictItemDto } from '../dto/update-dict-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';

@ApiTags('字典项管理')
@Controller('dict-items')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class DictItemController {
  constructor(private readonly dictItemService: DictItemService) {}

  @Post()
  @ApiOperation({ summary: '创建字典项' })
  create(@Body() createDictItemDto: CreateDictItemDto) {
    return this.dictItemService.create(createDictItemDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有字典项' })
  findAll() {
    return this.dictItemService.findAll();
  }

  @Get('type/:dictTypeId')
  @ApiOperation({ summary: '根据字典类型ID获取字典项' })
  @ApiParam({ name: 'dictTypeId', description: '字典类型ID' })
  findByDictTypeId(@Param('dictTypeId') dictTypeId: string) {
    return this.dictItemService.findByDictTypeId(+dictTypeId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据字典类型编码获取字典项' })
  @ApiParam({ name: 'code', description: '字典类型编码' })
  findByDictTypeCode(@Param('code') code: string) {
    return this.dictItemService.findByDictTypeCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取字典项' })
  @ApiParam({ name: 'id', description: '字典项ID' })
  findOne(@Param('id') id: string) {
    return this.dictItemService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新字典项' })
  @ApiParam({ name: 'id', description: '字典项ID' })
  update(@Param('id') id: string, @Body() updateDictItemDto: UpdateDictItemDto) {
    return this.dictItemService.update(+id, updateDictItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典项' })
  @ApiParam({ name: 'id', description: '字典项ID' })
  remove(@Param('id') id: string) {
    return this.dictItemService.remove(+id);
  }
}