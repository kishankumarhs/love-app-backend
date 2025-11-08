import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricType {
  USERS = 'users',
  PROVIDERS = 'providers',
  CAMPAIGNS = 'campaigns',
  DONATIONS = 'donations',
  VOLUNTEERS = 'volunteers',
  SOS_ALERTS = 'sos_alerts',
  REVIEWS = 'reviews',
}

export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('admin_analytics')
export class AdminAnalytics {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: MetricType })
  @Column({ type: 'varchar', length: 50 })
  metricType: MetricType;

  @ApiProperty()
  @Column({ length: 100 })
  metricName: string;

  @ApiProperty()
  @Column('decimal', { precision: 15, scale: 2 })
  metricValue: number;

  @ApiProperty({ enum: PeriodType })
  @Column({ type: 'varchar', length: 20 })
  periodType: PeriodType;

  @ApiProperty()
  @Column('date')
  periodStart: Date;

  @ApiProperty()
  @Column('date')
  periodEnd: Date;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}