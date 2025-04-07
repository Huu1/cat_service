import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DictItem } from './dict-item.entity';

@Entity('dict_types')
export class DictType extends BaseEntity {
  @Column({
    length: 100,
    unique: true,
    comment: '字典类型编码',
  })
  code: string;

  @Column({
    length: 100,
    comment: '字典类型名称',
  })
  name: string;

  @Column({
    nullable: true,
    length: 500,
    comment: '字典类型描述',
  })
  description: string;

  @Column({
    default: true,
    comment: '是否启用',
  })
  isEnabled: boolean;

  @OneToMany(() => DictItem, (dictItem) => dictItem.dictType)
  dictItems: DictItem[];
}