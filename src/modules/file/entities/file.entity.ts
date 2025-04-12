import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('files')
export class File extends BaseEntity {
  @Column({
    length: 255,
    comment: '文件原始名称',
  })
  originalName: string;

  @Column({
    unique: false,
    nullable: false,
    length: 100,
    comment: '文件名称',
  })
  fileName: string;

  @Column({
    length: 100,
    comment: '文件类型',
  })
  mimeType: string;

  @Column({
    comment: '文件大小(字节)',
  })
  size: number;

  @Column({
    length: 500,
    comment: '文件存储路径',
  })
  path: string;

  @Column({
    length: 500,
    comment: '文件访问URL',
  })
  url: string;

  @Column({
    nullable: true,
    length: 100,
    comment: '文件MD5',
  })
  md5: string;

  @Column({
    default: 'local',
    length: 50,
    comment: '存储位置(local:本地, oss:对象存储)',
  })
  storage: string;

  @Column({
    nullable: true,
    length: 500,
    comment: '文件描述',
  })
  description: string;

  @Column({
    nullable: true,
    length: 100,
    comment: '上传者ID',
  })
  uploaderId: string;

  @Column({
    nullable: true,
    length: 100,
    comment: '上传者名称',
  })
  uploaderName: string;
}