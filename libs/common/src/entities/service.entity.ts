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
import { Category } from './category.entity';

export enum ServiceVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('services')
@Index(['org_id', 'status'])
@Index(['category_id'])
@Index(['latitude', 'longitude'])
export class Service {
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
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text')
  description: string;

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
  eligibility: Record<string, any>;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  capacity: Record<string, any>;

  @ApiProperty({ enum: ServiceVisibility })
  @Column({ type: 'enum', enum: ServiceVisibility, default: ServiceVisibility.PUBLIC })
  visibility: ServiceVisibility;

  @ApiProperty({ enum: ServiceStatus })
  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.ACTIVE })
  status: ServiceStatus;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}