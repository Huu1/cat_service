import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum LogType {
  LOGIN = 'login',
  OPERATION = 'operation',
  ERROR = 'error'
}

@Entity('logs')
export class Log extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  username: string;

  @Column({
    type: 'enum',
    enum: LogType,
    default: LogType.OPERATION
  })
  type: LogType;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;
}