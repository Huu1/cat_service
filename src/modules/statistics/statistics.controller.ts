import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StatisticsQueryDto } from './dto/statistics.dto';

@ApiTags('统计')
@Controller('statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取收支统计' })
  async getStatistics(
    @CurrentUser() user: JwtPayload,
    @Query() query: StatisticsQueryDto
  ) {
    return this.statisticsService.getStatistics(user.userId, query);
  }
}