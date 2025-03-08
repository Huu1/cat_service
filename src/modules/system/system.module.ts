import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { Role } from '../user/entities/role.entity';
import { Category } from '../category/entities/category.entity';
import { AccountTemplate } from '../account-template/entities/account-template.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Category, AccountTemplate]),
  ],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}