import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum OrgKind {
  PROVIDER = 'provider',
  SPONSOR = 'sponsor',
  PARTNER = 'partner',
}

export enum OrgStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('orgs')
@Index(['kind', 'status'])
@Index(['verified_at'])
export class Org {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: OrgKind })
  @Column({ type: 'enum', enum: OrgKind })
  kind: OrgKind;

  @ApiProperty({ enum: OrgStatus })
  @Column({ type: 'enum', enum: OrgStatus, default: OrgStatus.PENDING })
  status: OrgStatus;

  @ApiProperty()
  @Column({ nullable: true })
  verified_at: Date;

  @ApiProperty()
  @Column({ default: false })
  trusted: boolean;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  domain: string;

  @ApiProperty()
  @Column()
  phone: string;

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
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}