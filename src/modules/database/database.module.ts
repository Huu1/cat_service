import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeedService } from './database-seed.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}