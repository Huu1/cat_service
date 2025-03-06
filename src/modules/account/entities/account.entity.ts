import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Book } from '../../book/entities/book.entity';
import { Record } from 'src/modules/record/entities/record.entity';

export enum AccountType {
  CASH = 'cash',       // 资金账户（现金、银行卡等）
  CREDIT = 'credit',   // 信用账户（信用卡、花呗等）
  INVESTMENT = 'investment', // 理财账户（基金、股票等）
  RECEIVABLE = 'receivable', // 应收款项
  PAYABLE = 'payable'   // 应付款项
}

@Entity('accounts')
export class Account extends BaseEntity {
  @Column({ 
      unique: false, 
      nullable: false,
      length: 50,
      comment: '账户名称'
    })
    name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CASH
  })
  type: AccountType;

  @Column('decimal', { 
      precision: 10, 
      scale: 2, 
      default: 0,
      comment: '账户余额'
    })
    balance: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, user => user.accounts)
  user: User;

  @ManyToOne(() => Book, book => book.accounts)
  book: Book;

  @OneToMany(() => Record, record => record.account)
  records: Record[];
}