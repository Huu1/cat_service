import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcryptjs';

import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';
import { BookService } from '../book/book.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private dataSource: DataSource, // 添加 DataSource
  ) {}

  async createWithRole(userData: Partial<User>, roleNames: string[] = ['user']) {
    return await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, userData);

      if (userData.password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(userData.password, salt);
      }

      // 查找角色，使用 code 而不是 name
      const roles = await Promise.all(
        roleNames.map((code) => manager.findOne(Role, { where: { code } })),
      );

      if (!roles.length) {
        throw new BusinessException(BusinessError.COMMON_ERROR, '未找到指定角色');
      }

      user.roles = roles.filter((role) => role);
      const savedUser = await manager.save(user);

      // 创建默认账本
      await manager.save('Book', {
        name: '默认账本',
        description: '系统自动创建的默认账本',
        isDefault: true,
        isSystemDefault: true,
        user: { id: savedUser.id },
      });

      return savedUser;
    });
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        roles: {
          permissions: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async findByOpenid(openid: string): Promise<User> {
    return this.userRepository.findOne({
      where: { openid },
      relations: ['roles'],
    });
  }

  async findAll(query: { username?: string; roleCode?: string }) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .orderBy('user.createdAt', 'DESC');

    if (query.username) {
      queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:username)', {
        username: `%${query.username}%`,
      });
    }

    if (query.roleCode) {
      queryBuilder.andWhere('roles.code = :roleCode', {
        roleCode: query.roleCode,
      });
    }

    return queryBuilder.getMany();
  }

  async updateUserInfo(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 只更新提供的字段
    Object.assign(user, updateUserDto);
    
    await this.userRepository.save(user);
    return user;
  }
}
