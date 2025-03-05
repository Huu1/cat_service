import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ 
    unique: true, 
    nullable: false,
    length: 50,
    comment: '角色名称'
  })
  name: string;

  @Column({ 
    nullable: false, 
    default: '', 
    length: 100,
    comment: '角色描述'
  })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}