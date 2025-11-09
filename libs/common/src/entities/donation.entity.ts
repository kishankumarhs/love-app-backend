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
import { Org } from './org.entity';
import { Campaign } from './campaign.entity';

export enum DonationProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('donations')
@Index(['donor_user_id'])
@Index(['provider_org_id'])
@Index(['campaign_id'])
@Index(['status'])
export class Donation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  donor_user_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'donor_user_id' })
  donor_user: User;

  @ApiProperty()
  @Column({ nullable: true })
  provider_org_id: string;

  @ManyToOne(() => Org, { nullable: true })
  @JoinColumn({ name: 'provider_org_id' })
  provider_org: Org;

  @ApiProperty()
  @Column({ nullable: true })
  campaign_id: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({ enum: DonationProvider })
  @Column({ type: 'enum', enum: DonationProvider })
  provider: DonationProvider;

  @ApiProperty({ enum: DonationStatus })
  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING })
  status: DonationStatus;

  @ApiProperty()
  @Column({ nullable: true })
  external_transaction_id: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}