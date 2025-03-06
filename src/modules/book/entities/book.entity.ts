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

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.books)
  user: User;

  @OneToMany(() => Account, (account) => account.book)
  accounts: Account[];

  @OneToMany(() => Record, (record) => record.book)
  records: Record[];
}
