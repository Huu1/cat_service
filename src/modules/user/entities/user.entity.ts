import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { OneToMany } from 'typeorm';
import { Book } from '../../book/entities/book.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { Record } from 'src/modules/record/entities/record.entity';

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
    nullable: false,
    length: 200,
  })
  password: string;

  @Column({ nullable: true })
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
