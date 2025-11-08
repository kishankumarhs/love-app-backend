import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Donation } from './donation.entity';

export enum RefundStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

@Entity('refunds')
export class Refund {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Donation)
  @JoinColumn()
  donation: Donation;

  @Column()
  donationId: string;

  @ApiProperty()
  @Column()
  stripeRefundId: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({ enum: RefundStatus })
  @Column({ type: 'varchar', length: 20, default: RefundStatus.PENDING })
  status: RefundStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  processedAt: Date;
}
