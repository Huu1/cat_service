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
  @ApiOperation({ summary: '创建或更新记账记录' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: Record
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: Record
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '记录不存在（更新时）' })
  async createOrUpdate(
    @CurrentUser() user: JwtPayload,
    @Body() recordDto: CreateRecordDto & { id?: number }
  ) {
    // 获取账户信息
    const account = await this.recordService.getAccount(user.userId, recordDto.accountId);
    
    // 如果是信用账户，调整金额计算方式
    if (['CREDIT', 'PAYABLE'].includes(account.type)) {
      // 对于信用账户，收入（还款）和支出（消费）的金额需要反转
      recordDto.amount = Math.abs(recordDto.amount); // 确保金额为正数
    }

    if (recordDto.id) {
      // 有ID，执行更新操作
      return this.recordService.update(user.userId, recordDto.id, recordDto);
    } else {
      // 无ID，执行创建操作
      return this.recordService.create(user.userId, recordDto);
    }
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

  // 可以删除原有的 Put 方法，因为已经合并到 Post 方法中
  // 或者保留 Put 方法作为兼容，调用相同的逻辑
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

  @Post(':id')
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