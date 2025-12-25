import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum ReportType {
  USERS = 'users',
  PROVIDERS = 'providers',
  CAMPAIGNS = 'campaigns',
  DONATIONS = 'donations',
  REVIEWS = 'reviews',
  VOLUNTEERS = 'volunteers',
  CUSTOM = 'custom',
}

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  JSON = 'json',
}

@Entity('reports')
export class Report {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ enum: ReportType })
  @Column({ type: 'varchar', length: 50 })
  type: ReportType;

  @ApiProperty()
  @Column({ type: 'jsonb', default: '{}' })
  filters: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'jsonb', default: '[]' })
  columns: string[];

  @ApiProperty({ enum: ReportFormat })
  @Column({ type: 'varchar', length: 10, default: ReportFormat.CSV })
  format: ReportFormat;

  @ApiProperty({ enum: ReportStatus })
  @Column({ type: 'varchar', length: 20, default: ReportStatus.PENDING })
  status: ReportStatus;

  @ApiProperty()
  @Column({ nullable: true, length: 500 })
  filePath: string;

  @ApiProperty()
  @Column({ nullable: true })
  fileSize: number;

  @ManyToOne(() => User)
  @JoinColumn()
  generatedBy: User;

  @Column()
  generatedById: string;

  @ApiProperty()
  @CreateDateColumn()
  generatedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  expiresAt: Date;

  @ApiProperty()
  @Column({ default: 0 })
  downloadCount: number;

  @ApiProperty()
  @Column({ nullable: true, type: 'text' })
  errorMessage: string;
}
