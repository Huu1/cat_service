import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Role } from './entities/role.entity';
import { BookModule } from '../book/book.module';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Permission } from './entities/permission.entity';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [
    UserController,
    RoleController,
    PermissionController,
  ],
  providers: [
    UserService,
    RoleService,
    PermissionService,
  ],
  exports: [
    UserService,
    RoleService,
    PermissionService,
    TypeOrmModule.forFeature([User, Role, Permission]), // 添加这一行，导出实体
  ],
})
export class UserModule {}