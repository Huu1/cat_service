import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Account } from '../../account/entities/account.entity';
import { AccountType } from '../../account/enums/account-type.enum';

@Entity('account_templates')
export class AccountTemplate extends BaseEntity {
  @Column({ 
      unique: true, 
      nullable: false,
      length: 50,
      comment: '模板名称'
    })
    name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.CASH,  // 添加默认值
    comment: '账户类型'
  })
  type: AccountType;

  @Column({ 
    nullable: true,
    length: 100,
    comment: '图标'
  })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  sort: number;

  @OneToMany(() => Account, account => account.template)
  accounts: Account[];
}