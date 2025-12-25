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
import { Volunteer } from './volunteer.entity';

export enum AssignmentType {
  CAMPAIGN_SUPPORT = 'campaign_support',
  EMERGENCY_RESPONSE = 'emergency_response',
  COMMUNITY_OUTREACH = 'community_outreach',
  TECHNICAL_SUPPORT = 'technical_support',
}

export enum AssignmentStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('volunteer_assignments')
export class VolunteerAssignment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Volunteer)
  @JoinColumn()
  volunteer: Volunteer;

  @Column()
  volunteerId: string;

  @ManyToOne('Campaign', { nullable: true })
  @JoinColumn()
  campaign: any;

  @Column({ nullable: true })
  campaignId: string;

  @ManyToOne('Provider', { nullable: true })
  @JoinColumn()
  provider: any;

  @Column({ nullable: true })
  providerId: string;

  @ApiProperty({ enum: AssignmentType })
  @Column({ type: 'varchar', length: 50 })
  assignmentType: AssignmentType;

  @ApiProperty({ enum: AssignmentStatus })
  @Column({ type: 'varchar', length: 20, default: AssignmentStatus.ASSIGNED })
  status: AssignmentStatus;

  @ApiProperty({ enum: AssignmentPriority })
  @Column({ type: 'varchar', length: 10, default: AssignmentPriority.MEDIUM })
  priority: AssignmentPriority;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  description: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  location: {
    address?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
  };

  @ApiProperty()
  @Column({ nullable: true })
  scheduledAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  startedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  feedback: string;

  @ApiProperty()
  @Column({ nullable: true })
  rating: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
