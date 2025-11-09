import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@love-app/common/entities/user.entity';
import { NotificationTemplate, NotificationType } from './notification-template.entity';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@Entity('notifications')
@Index(['recipient_id', 'status'])
@Index(['template_id'])
@Index(['created_at'])
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  recipient_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ApiProperty()
  @Column()
  template_id: string;

  @ManyToOne(() => NotificationTemplate)
  @JoinColumn({ name: 'template_id' })
  template: NotificationTemplate;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty()
  @Column('text')
  body: string;

  @ApiProperty()
  @Column({ nullable: true })
  recipient_email: string;

  @ApiProperty()
  @Column({ nullable: true })
  recipient_phone: string;

  @ApiProperty({ enum: NotificationStatus })
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @ApiProperty()
  @Column({ nullable: true })
  external_id: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true })
  sent_at: Date;

  @ApiProperty()
  @Column({ nullable: true })
  delivered_at: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  error_message: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}