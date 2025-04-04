import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeedService } from './database-seed.service';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import { Category } from '../category/entities/category.entity';
import { AccountTemplate } from '../account-template/entities/account-template.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Category, AccountTemplate]),
    UserModule, // 确保能访问 RoleService 和 PermissionService
  ],
  providers: [DatabaseSeedService],
  exports: [DatabaseSeedService],
})
export class DatabaseModule {}