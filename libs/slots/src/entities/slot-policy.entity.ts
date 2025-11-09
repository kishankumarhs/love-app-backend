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

@Entity('slot_policies')
@Index(['service_id'])
@Index(['campaign_id'])
export class SlotPolicy {
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
  @Column('int', { default: 30 })
  slot_size: number; // in minutes

  @ApiProperty()
  @Column('int', { default: 10 })
  max_per_slot: number;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  operating_hours: Record<string, any>; // { "monday": { "start": "09:00", "end": "17:00" } }

  @ApiProperty()
  @Column('int', { default: 60 })
  booking_lead_time: number; // in minutes

  @ApiProperty()
  @Column('int', { default: 30 })
  cancel_cutoff: number; // in minutes

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}