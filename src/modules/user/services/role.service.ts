import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { BusinessError } from '../../../common/enums/business-error.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;
    
    // 检查角色代码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: roleData.code }
    });
    
    if (existingRole) {
      throw new BusinessException(BusinessError.COMMON_ERROR, '角色代码已存在');
    }

    const role = this.roleRepository.create(roleData);

    if (permissionIds?.length) {
      const permissions = await this.permissionRepository.findByIds(permissionIds);
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find({
      relations: ['permissions']
    });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions']
    });

    if (!role) {
      throw new BusinessException(BusinessError.NOT_FOUND, '角色不存在');
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...roleData } = updateRoleDto;
    const role = await this.findOne(id);

    if (roleData.code && roleData.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: roleData.code }
      });
      
      if (existingRole) {
        throw new BusinessException(BusinessError.COMMON_ERROR, '角色代码已存在');
      }
    }

    Object.assign(role, roleData);

    if (permissionIds?.length) {
      const permissions = await this.permissionRepository.findByIds(permissionIds);
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    return this.roleRepository.softRemove(role);
  }
}