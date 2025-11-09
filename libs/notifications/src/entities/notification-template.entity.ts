import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum TemplateCategory {
  SOS = 'sos',
  REFERRAL = 'referral',
  DONATION = 'donation',
  VOLUNTEER = 'volunteer',
  SYSTEM = 'system',
}

@Entity('notification_templates')
@Index(['type', 'category'])
@Index(['key'])
export class NotificationTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  key: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: NotificationType })
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: TemplateCategory })
  @Column({ type: 'enum', enum: TemplateCategory })
  category: TemplateCategory;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty()
  @Column('text')
  body: string;

  @ApiProperty()
  @Column('simple-array', { default: '' })
  variables: string[];

  @ApiProperty()
  @Column({ default: true })
  active: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}