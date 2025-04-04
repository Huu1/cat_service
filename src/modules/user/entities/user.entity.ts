import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Book } from '../../book/entities/book.entity';
import { Account } from '../../account/entities/account.entity';
import { Record } from '../../record/entities/record.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    unique: false,
    nullable: false,
    length: 50,
    comment: '用户名称',
  })
  username: string;

  @Column({
    unique: false,
    nullable: true,
    length: 50,
    comment: '用户昵称',
  })
  nickname: string;

  @Column({
    nullable: true,
    length: 200,
    comment: '用户头像',
  })
  avatar: string;

  @Column({
    nullable: true,
    length: 100,
    comment: '用户邮箱',
  })
  email: string;

  @Column({ 
    unique: false, 
    nullable: false,
    length: 200,
  })
  password: string;

  @Column({ 
    nullable: true,
    comment: '微信小程序用户openid',
    length: 100,
    unique: false,
  })
  openid: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Book, (book) => book.user)
  books: Book[];

  @OneToMany(() => Account, account => account.user)
  accounts: Account[];

  @OneToMany(() => Record, record => record.user)
  records: Record[];
}
