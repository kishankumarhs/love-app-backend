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
import { Org } from './org.entity';

export enum VoucherType {
  AMOUNT = 'amount',
  UNIT = 'unit',
  ACCESS = 'access',
}

export enum VoucherStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('vouchers')
@Index(['issuer_org_id'])
@Index(['sponsor_partner_id'])
@Index(['code'])
@Index(['valid_from', 'valid_to'])
export class Voucher {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: VoucherType })
  @Column({ type: 'enum', enum: VoucherType })
  type: VoucherType;

  @ApiProperty()
  @Column()
  issuer_org_id: string;

  @ManyToOne(() => Org)
  @JoinColumn({ name: 'issuer_org_id' })
  issuer_org: Org;

  @ApiProperty()
  @Column({ nullable: true })
  sponsor_partner_id: string;

  @ManyToOne(() => Org, { nullable: true })
  @JoinColumn({ name: 'sponsor_partner_id' })
  sponsor_partner: Org;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  value: number;

  @ApiProperty()
  @Column({ nullable: true })
  unit_label: string;

  @ApiProperty()
  @Column()
  valid_from: Date;

  @ApiProperty()
  @Column()
  valid_to: Date;

  @ApiProperty()
  @Column('int', { default: 1 })
  usage_limit: number;

  @ApiProperty()
  @Column('int', { default: 0 })
  usage_count: number;

  @ApiProperty()
  @Column({ unique: true })
  code: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  qr_code: string;

  @ApiProperty({ enum: VoucherStatus })
  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.ACTIVE })
  status: VoucherStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}