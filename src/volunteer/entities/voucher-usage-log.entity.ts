import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WifiVoucher } from './wifi-voucher.entity';

export enum VoucherEventType {
  CREATED = 'created',
  ACTIVATED = 'activated',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  BANDWIDTH_EXCEEDED = 'bandwidth_exceeded',
}

/**
 * Voucher Usage Log
 * - Tracks lifecycle events: Created, Activated, Used, Expired.
 * - Mobile App: 'activated' event = User redeemed code via `POST /vouchers/redeem`.
 * - Stores `userId` to link redemption to a specific app user.
 */
@Entity('voucher_usage_logs')
export class VoucherUsageLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WifiVoucher)
  @JoinColumn()
  voucher: WifiVoucher;

  @Column()
  voucherId: string;

  @ApiProperty({ enum: VoucherEventType })
  @Column({ type: 'varchar', length: 50 })
  eventType: VoucherEventType;

  @ApiProperty()
  @Column({ nullable: true, length: 17 })
  deviceMac: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  deviceInfo: {
    deviceType?: string;
    userAgent?: string;
    os?: string;
  };

  @ApiProperty()
  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  dataUsedMb: number;

  @ApiProperty()
  @Column({ nullable: true })
  sessionDurationMinutes: number;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({ nullable: true })
  userId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
