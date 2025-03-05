import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
export class User  extends BaseEntity {

  @Column({ unique: true ,default:''})
  username: string;

  @Column({ unique: true ,default:''})
  password: string;

  @Column({ nullable: true })
  openid: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable()
  roles: Role[];
}