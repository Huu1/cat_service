import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DictTypeService } from '../services/dict-type.service';
import { CreateDictTypeDto } from '../dto/create-dict-type.dto';
import { UpdateDictTypeDto } from '../dto/update-dict-type.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';

@ApiTags('字典类型管理')
@Controller('dict-types')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class DictTypeController {
  constructor(private readonly dictTypeService: DictTypeService) {}

  @Post()
  @ApiOperation({ summary: '创建字典类型' })
  create(@Body() createDictTypeDto: CreateDictTypeDto) {
    return this.dictTypeService.create(createDictTypeDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有字典类型' })
  findAll() {
    return this.dictTypeService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码获取字典类型' })
  @ApiParam({ name: 'code', description: '字典类型编码' })
  findByCode(@Param('code') code: string) {
    return this.dictTypeService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取字典类型' })
  @ApiParam({ name: 'id', description: '字典类型ID' })
  findOne(@Param('id') id: string) {
    return this.dictTypeService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新字典类型' })
  @ApiParam({ name: 'id', description: '字典类型ID' })
  update(@Param('id') id: string, @Body() updateDictTypeDto: UpdateDictTypeDto) {
    return this.dictTypeService.update(+id, updateDictTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典类型' })
  @ApiParam({ name: 'id', description: '字典类型ID' })
  remove(@Param('id') id: string) {
    return this.dictTypeService.remove(+id);
  }
}