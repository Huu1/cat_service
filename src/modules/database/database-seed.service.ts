import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    await this.dataSource.transaction(async manager => {
      // 初始化角色
      const roles = [
        { name: 'admin', description: '系统管理员' },
        { name: 'user', description: '普通用户' }
      ];

      for (const roleData of roles) {
        const existingRole = await manager.findOne(Role, {
          where: { name: roleData.name }
        });

        if (existingRole) {
          // 如果角色存在，更新描述
          await manager.update(Role, { id: existingRole.id }, roleData);
        } else {
          // 如果角色不存在，创建新角色
          await manager.save(Role, roleData);
        }
      }

      // 初始化管理员用户
      const adminRole = await manager.findOne(Role, {
        where: { name: 'admin' }
      });

      const adminUsername = this.configService.get('ADMIN_USERNAME', 'admin');
      const existingAdmin = await manager.findOne(User, {
        where: { username: adminUsername }
      });

      if (!existingAdmin && adminRole) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(
          this.configService.get('ADMIN_PASSWORD', 'admin123'),
          salt
        );

        await manager.save(User, {
          username: adminUsername,
          password: hashedPassword,
          isActive: true,
          roles: [adminRole]
        });
      }
    });
  }
}