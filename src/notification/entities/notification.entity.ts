import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { NotificationTemplate } from './notification-template.entity';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  GENERAL = 'general',
  SOS = 'sos',
  CAMPAIGN = 'campaign',
  DONATION = 'donation',
  VOLUNTEER = 'volunteer',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text')
  message: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'varchar', length: 20 })
  type: NotificationType;

  @ApiProperty({ enum: NotificationStatus })
  @Column({ type: 'varchar', length: 20, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @ApiProperty({ enum: NotificationPriority })
  @Column({ type: 'varchar', length: 10, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @ApiProperty({ enum: NotificationCategory })
  @Column({ type: 'varchar', length: 50, default: NotificationCategory.GENERAL })
  category: NotificationCategory;

  @ManyToOne(() => NotificationTemplate, { nullable: true })
  @JoinColumn()
  template: NotificationTemplate;

  @Column({ nullable: true })
  templateId: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  templateData: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true })
  sentAt: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  failedReason: string;

  @ApiProperty()
  @Column({ default: 0 })
  retryCount: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}