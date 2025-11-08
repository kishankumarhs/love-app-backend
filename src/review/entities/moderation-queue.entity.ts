import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum ContentType {
  REVIEW = 'review',
  COMMENT = 'comment',
  REPORT = 'report',
  USER_PROFILE = 'user_profile',
}

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  FAKE = 'fake',
  OFFENSIVE = 'offensive',
  OTHER = 'other',
}

export enum ModerationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ModerationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('moderation_queue')
export class ModerationQueue {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ContentType })
  @Column({ type: 'varchar', length: 50 })
  contentType: ContentType;

  @ApiProperty()
  @Column('uuid')
  contentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  reportedBy: User;

  @Column({ nullable: true })
  reportedById: string;

  @ApiProperty({ enum: ReportReason })
  @Column({ type: 'varchar', length: 100 })
  reason: ReportReason;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  description: string;

  @ApiProperty({ enum: ModerationStatus })
  @Column({ type: 'varchar', length: 20, default: ModerationStatus.PENDING })
  status: ModerationStatus;

  @ApiProperty({ enum: ModerationPriority })
  @Column({ type: 'varchar', length: 10, default: ModerationPriority.MEDIUM })
  priority: ModerationPriority;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  resolvedBy: User;

  @Column({ nullable: true })
  resolvedById: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  resolutionNotes: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  resolvedAt: Date;
}
