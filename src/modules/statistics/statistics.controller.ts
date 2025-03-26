import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StatisticsDetailQueryDto, StatisticsQueryDto } from './dto/statistics.dto';

@ApiTags('统计当月/当年 收入-支出-结余')
@Controller('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取收支统计' })
  @ApiQuery({
    name: 'bookId',
    required: false,
    type: Number,
    description: '账本ID，不传则查询所有账本',
  })
  async getStatistics(
    @CurrentUser() user: JwtPayload,
    @Query() query: StatisticsQueryDto
  ) {
    return this.statisticsService.getStatistics(user.userId, query);
  }

  @Get('details')
  @ApiOperation({ summary: '获取收支明细统计' })
  @ApiQuery({
    name: 'bookId',
    required: false,
    type: Number,
    description: '账本ID，不传则查询所有账本',
  })
  async getStatisticsDetail(
    @CurrentUser() user: JwtPayload,
    @Query() query: StatisticsDetailQueryDto
  ) {
    return this.statisticsService.getStatisticsDetail(user.userId, query);
  }
}