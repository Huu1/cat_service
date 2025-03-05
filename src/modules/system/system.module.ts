import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}