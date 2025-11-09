import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
@Index(['actor_id'])
@Index(['entity_type', 'entity_id'])
@Index(['action'])
@Index(['timestamp'])
export class AuditLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  actor_id: string;

  @ApiProperty()
  @Column()
  action: string;

  @ApiProperty()
  @Column()
  entity_type: string;

  @ApiProperty()
  @Column()
  entity_id: string;

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  before: Record<string, any>;

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  after: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  timestamp: Date;
}