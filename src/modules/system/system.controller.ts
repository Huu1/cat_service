import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SystemService } from './system.service';

@ApiTags('系统管理')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @ApiOperation({ summary: '初始化系统' })
  @Post('init')
  async initSystem() {
    return this.systemService.initSystem();
  }
}