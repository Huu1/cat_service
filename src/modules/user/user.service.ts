import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';
import { BookService } from '../book/book.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private dataSource: DataSource,  // 添加 DataSource
  ) {}

  async createWithRole(userData: Partial<User>, roleNames: string[]) {
    return await this.dataSource.transaction(async manager => {
      const user = manager.create(User, userData);

      if (userData.password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(userData.password, salt);
      }

      const roles = await Promise.all(
        roleNames.map((name) => manager.findOne(Role, { where: { name } })),
      );
      user.roles = roles.filter((role) => role);

      const savedUser = await manager.save(user);

      // 创建默认账本
      await manager.save('Book', {
        name: '默认账本',
        description: '系统自动创建的默认账本',
        isDefault: true,
        user: { id: savedUser.id }
      });

      return savedUser;
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: ['id', 'username', 'isActive', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new BusinessException(BusinessError.USER_NOT_FOUND, '用户不存在');
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
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .orderBy('user.createdAt', 'DESC');

    if (query.username) {
      queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:username)', {
        username: `%${query.username}%`
      });
    }

    if (query.roleCode) {
      queryBuilder.andWhere('roles.code = :roleCode', {
        roleCode: query.roleCode
      });
    }

    return queryBuilder.getMany();
  }
  
  async createOrUpdateByOpenid(openid: string, userInfo: any) {
      // 查找是否已存在该 openid 的用户
      let user = await this.userRepository.findOne({ where: { openid } });
      
      if (user) {
        // 更新用户信息
        // user.nickname = userInfo.nickName || user.nickname;
        // user.avatar = userInfo.avatarUrl || user.avatar;
        // user.gender = userInfo.gender !== undefined ? userInfo.gender : user.gender;
        
        return this.userRepository.save(user);
      } else {
        // 使用事务创建新用户和默认账本
        return await this.dataSource.transaction(async manager => {
          // 生成并加密密码
          const password = this.generateRandomPassword();
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(password, salt);
          
          // 创建用户
          const newUser = manager.create(User, {
            openid,
            password: hashedPassword,
            username: `user_${Date.now()}`, // 添加一个默认用户名
          });
          
          // 保存用户
          const savedUser = await manager.save(newUser);
          
          // 创建默认账本
          await manager.save('Book', {
            name: '默认账本',
            description: '系统自动创建的默认账本',
            isDefault: true,
            user: { id: savedUser.id }
          });
          
          return savedUser;
        });
      }
    }
    
    // 生成随机密码
    private generateRandomPassword(): string {
      const length = 16;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
      let password = '';
      
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return password;
    }
}
