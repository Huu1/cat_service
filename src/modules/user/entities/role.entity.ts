import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';


@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    length: 50,
    unique: true,
    nullable: false,
    comment: '角色标识符'
  })
  code: string;

  @Column({
    length: 50,
    nullable: false,
    comment: '角色名称'
  })
  name: string;

  @Column({
    length: 100,
    nullable: true,
    default: '',
    comment: '角色描述'
  })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' }
  })
  permissions: Permission[];
}