import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { Record } from 'src/modules/record/entities/record.entity';

@Entity('books')
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: false,
    nullable: false,
    length: 50,
    comment: '账本名称',
  })
  name: string;

  @Column({ unique: false, nullable: true, length: 100, comment: '图标' })
  icon: string;

  @Column({
    unique: false,
    nullable: true,
    length: 100,
    comment: '图标背景颜色',
  })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false, name: 'is_system_default' })
  isSystemDefault: boolean; // 新增字段：是否为系统创建的默认账本

  @ManyToOne(() => User, (user) => user.books)
  user: User;

  @OneToMany(() => Account, (account) => account.book)
  accounts: Account[];

  @OneToMany(() => Record, (record) => record.book)
  records: Record[];
}
