import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BusinessError } from '../../common/enums/business-error.enum';
import { BookService } from '../book/book.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private bookService: BookService,
  ) {}

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

  async createWithRole(userData: Partial<User>, roleNames: string[]) {
    const user = this.userRepository.create(userData);

    if (userData.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(userData.password, salt);
    }

    const roles = await Promise.all(
      roleNames.map((name) => this.roleRepository.findOne({ where: { name } })),
    );
    user.roles = roles.filter((role) => role);

    const savedUser = await this.userRepository.save(user);

    // 创建用户后，创建默认账本
    await this.bookService.create(savedUser.id, {
      name: '默认账本',
      description: '系统自动创建的默认账本',
      isDefault: true,
    });

    return savedUser;
  }
}
