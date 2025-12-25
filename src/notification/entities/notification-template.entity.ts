import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum TemplateCategory {
  GENERAL = 'general',
  SOS = 'sos',
  CAMPAIGN = 'campaign',
  DONATION = 'donation',
  VOLUNTEER = 'volunteer',
  SYSTEM = 'system',
}

@Entity('notification_templates')
export class NotificationTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ enum: TemplateType })
  @Column({ type: 'varchar', length: 20 })
  type: TemplateType;

  @ApiProperty({ enum: TemplateCategory })
  @Column({ type: 'varchar', length: 50 })
  category: TemplateCategory;

  @ApiProperty()
  @Column({ nullable: true, length: 500 })
  subject: string;

  @ApiProperty()
  @Column('text')
  templateContent: string;

  @ApiProperty()
  @Column('jsonb', { default: '[]' })
  variables: string[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
