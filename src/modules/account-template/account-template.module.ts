import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTemplateController } from './account-template.controller';
import { AccountTemplateService } from './account-template.service';
import { AccountTemplate } from './entities/account-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountTemplate])],
  controllers: [AccountTemplateController],
  providers: [AccountTemplateService],
  exports: [AccountTemplateService],
})
export class AccountTemplateModule {}