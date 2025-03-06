import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Record } from 'src/modules/record/entities/record.entity';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ 
      unique: false, 
      nullable: false,
      length: 50,
      comment: '分类名称'
    })
    name: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.EXPENSE
  })
  type: CategoryType;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sort: number;

  @OneToMany(() => Record, record => record.category)
  records: Record[];
}