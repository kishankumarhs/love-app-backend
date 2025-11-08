import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum FeedbackType {
  BUG = 'bug',
  FEATURE = 'feature',
  GENERAL = 'general',
  COMPLAINT = 'complaint',
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

@Entity('feedback')
export class Feedback {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: FeedbackType })
  @Column({ type: 'enum', enum: FeedbackType })
  type: FeedbackType;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty()
  @Column('text')
  message: string;

  @ApiProperty({ enum: FeedbackStatus })
  @Column({
    type: 'enum',
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  status: FeedbackStatus;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
