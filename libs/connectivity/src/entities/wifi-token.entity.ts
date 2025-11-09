import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TokenStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
}

@Entity('wifi_tokens')
@Index(['token'])
@Index(['expires_at'])
export class WifiToken {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  token: string;

  @ApiProperty()
  @Column('int', { default: 3600 }) // 1 hour in seconds
  ttl: number;

  @ApiProperty()
  @Column()
  expires_at: Date;

  @ApiProperty({ enum: TokenStatus })
  @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE })
  status: TokenStatus;

  @ApiProperty()
  @Column({ nullable: true })
  used_at: Date;

  @ApiProperty()
  @Column({ nullable: true })
  user_id: string;

  @ApiProperty()
  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}