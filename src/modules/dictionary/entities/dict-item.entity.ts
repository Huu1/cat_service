import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DictType } from './dict-type.entity';

@Entity('dict_items')
export class DictItem extends BaseEntity {
  @Column({
    length: 100,
    comment: '字典项编码',
  })
  code: string;

  @Column({
    length: 100,
    comment: '字典项标签',
  })
  label: string;

  @Column({
    unique: false,
    nullable: false,
    length: 300,
    comment: '分类名称',
  })
  value: string;

  @Column({
    default: 0,
    comment: '排序号',
  })
  sort: number;

  @Column({
    nullable: true,
    length: 500,
    comment: '字典项描述',
  })
  description: string;

  @Column({
    default: true,
    comment: '是否启用',
  })
  isEnabled: boolean;

  @Column({
    nullable: true,
    length: 255,
    comment: '附加数据',
  })
  additionalData: string;

  @ManyToOne(() => DictType, (dictType) => dictType.dictItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  dictType: DictType;

  @Column()
  dictTypeId: number;
}