import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Book } from '../../book/entities/book.entity';
import { Account } from '../../account/entities/account.entity';
import { Category } from '../../category/entities/category.entity';

export enum RecordType {
  INCOME = 'income',   // 收入
  EXPENSE = 'expense'  // 支出
}

@Entity('records')
export class Record extends BaseEntity {

  @Column({
    type: 'enum',
    enum: RecordType,
    comment: '记录类型'
  })
  type: RecordType;

  @Column('decimal', { 
    precision: 10, 
    scale: 2,
    comment: '记录金额',
    nullable: false
  })
  amount: number;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: '备注'
  })
  note: string;

  @ManyToOne(() => User, user => user.records, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  user: User;

  @ManyToOne(() => Book, book => book.records, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  book: Book;

  @ManyToOne(() => Account, account => account.records, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ nullable: true })
  accountId: number;

  @ManyToOne(() => Category, category => category.records, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  category: Category;

  @Index('idx_record_date')
  @Column({ 
    type: 'timestamp',  // 改为 timestamp 类型
    comment: '记账日期'
  })
  recordDate: Date;
  
  @Column('simple-array', { nullable: true })
  images: string[];
}