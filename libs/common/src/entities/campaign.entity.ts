import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Org } from './org.entity';
import { CampaignLocation } from './campaign-location.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CampaignVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
}

@Entity('campaigns')
@Index(['org_id', 'status'])
@Index(['start_at', 'end_at'])
export class Campaign {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  org_id: string;

  @ManyToOne(() => Org)
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column()
  start_at: Date;

  @ApiProperty()
  @Column()
  end_at: Date;

  @ApiProperty({ enum: CampaignStatus })
  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @ApiProperty({ enum: CampaignVisibility })
  @Column({ type: 'enum', enum: CampaignVisibility, default: CampaignVisibility.PUBLIC })
  visibility: CampaignVisibility;

  @OneToMany(() => CampaignLocation, (location) => location.campaign)
  locations: CampaignLocation[];

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}