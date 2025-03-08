import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({
    length: 50,
    unique: true,
    nullable: false,
    comment: '权限标识符'
  })
  code: string;

  @Column({
    length: 50,
    nullable: false,
    comment: '权限名称'
  })
  name: string;

  @Column({
    length: 100,
    nullable: true,
    default: '',
    comment: '权限描述'
  })
  description: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}