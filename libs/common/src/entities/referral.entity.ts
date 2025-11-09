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
import { User } from './user.entity';
import { Service } from './service.entity';
import { Campaign } from './campaign.entity';

export enum ReferralStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('referrals')
@Index(['seeker_id', 'status'])
@Index(['service_id'])
@Index(['campaign_id'])
@Index(['scheduled_at'])
export class Referral {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  seeker_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @ApiProperty()
  @Column({ nullable: true })
  service_id: string;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ApiProperty()
  @Column({ nullable: true })
  campaign_id: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ApiProperty({ enum: ReferralStatus })
  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @ApiProperty()
  @Column({ nullable: true })
  scheduled_at: Date;

  @ApiProperty()
  @Column({ nullable: true })
  fulfilled_at: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}