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
import { Campaign } from './campaign.entity';

@Entity('campaign_locations')
@Index(['campaign_id'])
@Index(['latitude', 'longitude'])
export class CampaignLocation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  campaign_id: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.locations)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ApiProperty()
  @Column('text')
  address: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  hours: Record<string, any>;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  capacity: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}