import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/permission.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { BusinessError } from '../../../common/enums/business-error.enum';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code }
    });
    
    if (existingPermission) {
      throw new BusinessException(BusinessError.COMMON_ERROR, '权限代码已存在');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll() {
    return this.permissionRepository.find();
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id }
    });

    if (!permission) {
      throw new BusinessException(BusinessError.NOT_FOUND, '权限不存在');
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);

    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code }
      });
      
      if (existingPermission) {
        throw new BusinessException(BusinessError.COMMON_ERROR, '权限代码已存在');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number) {
    const permission = await this.findOne(id);
    return this.permissionRepository.softRemove(permission);
  }
}