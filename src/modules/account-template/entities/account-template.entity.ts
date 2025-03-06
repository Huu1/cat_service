import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AccountType } from '../../account/entities/account.entity';

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
    enum: AccountType
  })
  type: AccountType;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  sort: number;
}