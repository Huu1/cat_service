import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RangeStatisticsQueryDto, StatisticsDetailQueryDto, StatisticsQueryDto } from './dto/statistics.dto';

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

  // 将原来的 GET 请求改为 POST
  @Post('rangeDetails')
  @ApiOperation({ summary: '按时间范围统计收支和分类详情' })
  async getRangeStatistics(
    @CurrentUser() user: JwtPayload,
    @Body() query: RangeStatisticsQueryDto
  ) {
    return this.statisticsService.getRangeStatistics(user.userId, query);
  }

  @Post('incomeAndExpendTrend')
  @ApiOperation({ summary: '按时间范围统计收支趋势' })
  async getDailyTrend(
    @CurrentUser() user: JwtPayload,
    @Body() query: RangeStatisticsQueryDto
  ) {
    return this.statisticsService.getDailyTrend(user.userId, query);
  }

  @Post('assetsTrend')
  @ApiOperation({ summary: '按时间范围统计资产负债趋势' })
  async getAssetsTrend(
    @CurrentUser() user: JwtPayload,
    @Body() query: RangeStatisticsQueryDto
  ) {
    return this.statisticsService.getAssetsTrend(user.userId, query);
  }
}