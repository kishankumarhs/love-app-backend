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
import { Provider } from '../../provider/entities/provider.entity';
import { Campaign } from '../../campaign/entities/campaign.entity';

export enum VoucherStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('wifi_vouchers')
export class WifiVoucher {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true, length: 20 })
  code: string;

  @ManyToOne(() => Provider)
  @JoinColumn()
  provider: Provider;

  @Column()
  providerId: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn()
  campaign: Campaign;

  @Column({ nullable: true })
  campaignId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ApiProperty({ enum: VoucherStatus })
  @Column({ type: 'varchar', length: 20, default: VoucherStatus.ACTIVE })
  status: VoucherStatus;

  @ApiProperty()
  @Column({ default: 24 })
  durationHours: number;

  @ApiProperty()
  @Column({ nullable: true })
  bandwidthLimitMb: number;

  @ApiProperty()
  @Column({ default: 1 })
  maxDevices: number;

  @ApiProperty()
  @Column()
  expiresAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  activatedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  usedAt: Date;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  deviceInfo: {
    macAddress?: string;
    deviceType?: string;
    userAgent?: string;
  };

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  usageStats: {
    dataUsedMb?: number;
    sessionDurationMinutes?: number;
    devicesConnected?: number;
  };

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
