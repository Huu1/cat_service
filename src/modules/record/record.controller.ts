import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RecordService } from './record.service';
import { CreateRecordDto, UpdateRecordDto } from './dto/record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Record } from './entities/record.entity';

@ApiTags('记账记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  @ApiOperation({ summary: '创建记账记录' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: Record
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createRecordDto: CreateRecordDto
  ) {
    return this.recordService.create(user.userId, createRecordDto);
  }

  @Get()
  @ApiOperation({ summary: '获取记账记录列表' })
  @ApiQuery({
    name: 'bookId',
    required: false,
    type: Number,
    description: '账本ID（可选）'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [Record]
  })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('bookId') bookId?: number
  ) {
    return this.recordService.findAll(user.userId, bookId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定记账记录' })
  @ApiParam({
    name: 'id',
    description: '记录ID'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: Record
  })
  @ApiResponse({ status: 404, description: '记录不存在' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string
  ) {
    return this.recordService.findOne(user.userId, +id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新记账记录' })
  @ApiParam({
    name: 'id',
    description: '记录ID'
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: Record
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto
  ) {
    return this.recordService.update(user.userId, +id, updateRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除记账记录' })
  @ApiParam({
    name: 'id',
    description: '记录ID'
  })
  @ApiResponse({
    status: 200,
    description: '删除成功'
  })
  @ApiResponse({ status: 404, description: '记录不存在' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string
  ) {
    return this.recordService.remove(user.userId, +id);
  }
}