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
import { Service } from '@love-app/common/entities/service.entity';
import { Campaign } from '@love-app/common/entities/campaign.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
}

@Entity('slots')
@Index(['service_id', 'start_time'])
@Index(['campaign_id', 'start_time'])
@Index(['start_time', 'end_time'])
export class Slot {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ApiProperty()
  @Column('timestamp')
  start_time: Date;

  @ApiProperty()
  @Column('timestamp')
  end_time: Date;

  @ApiProperty()
  @Column('int', { default: 0 })
  current_bookings: number;

  @ApiProperty()
  @Column('int')
  max_capacity: number;

  @ApiProperty({ enum: SlotStatus })
  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status: SlotStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}