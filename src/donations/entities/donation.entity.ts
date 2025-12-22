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

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('donations')
export class Donation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ enum: DonationStatus })
  @Column({ type: 'varchar', length: 20, default: DonationStatus.PENDING })
  status: DonationStatus;

  @ApiProperty()
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  stripeChargeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne('Campaign')
  @JoinColumn()
  campaign: any;

  @Column()
  campaignId: string;

  @ManyToOne('Provider', { nullable: true })
  @JoinColumn()
  provider: any;

  @Column({ nullable: true })
  providerId: string;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  failureReason: string;

  @ApiProperty()
  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  refundedAt: Date;
}
